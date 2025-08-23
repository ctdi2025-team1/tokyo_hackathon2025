const API_URL =
    "https://services3.arcgis.com/UtdeFTavkHfI94t2/arcgis/rest/services/131130_garbage_amount/FeatureServer/0/query";

const D = 10; // 昼間時間（8:00–17:59）
const N = 14; // 夜間時間（18:00–7:59）

const THIS_YEAR = 2025;

// ==== 1. 昼夜人口を使って1日平均人口を計算 ====
function calcDailyAveragePopulation(dayPop: number, nightPop: number): number {
    return (dayPop * D + nightPop * N) / 24;
}

// ==== 2. g/人・日に換算 ====
function convertToGPerPersonPerDay(totalG: number, dailyAvgPop: number): number {
    return totalG / dailyAvgPop;
}

// ==== 3. 渋谷区 KPI を取得 ====
export async function getKPIShibuya(): Promise<{
    household_gpd: number;
    delta_household: number;
    yearlyTotal: number;
    lastUpdated: string;
}> {
    // a. 昼夜人口（e-Statなどから取得する想定。今はダミー）
    // cf: https://www.e-stat.go.jp/dbview?sid=0004003060
    const dayPop = 550000;
    const nightPop = 230000;
    const dailyAvgPop = calcDailyAveragePopulation(dayPop, nightPop);

    // b. ArcGIS APIからごみ排出データを取得
    const rawData = await fetchGarbageData();

    // c. 家庭ごみのみ & 日付順にソート
    const sortedByDate = rawData
        .filter((f) => f.type === "可燃")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(rawData);
    console.log(sortedByDate);

    if (sortedByDate.length < 2) throw new Error("Not enough garbage data found");

    // 最新日と前日
    const latest = sortedByDate[0];
    const previous = sortedByDate[1];

    // d. g/人・日に換算
    const household_gpd = convertToGPerPersonPerDay(
        latest.amountTon * 1_000_000,
        dailyAvgPop
    );
    const delta_household =
        household_gpd -
        convertToGPerPersonPerDay(previous.amountTon * 1_000_000, dailyAvgPop);

    // 年ごとに累積
    const yearlyTotals: Record<number, number> = {};

    for (const item of rawData) {
        if (!yearlyTotals[item.year]) {
            yearlyTotals[item.year] = 0;
        }
        yearlyTotals[item.year] += item.amountTon;
    }

    return {
        household_gpd,
        delta_household,
        yearlyTotal: yearlyTotals[THIS_YEAR],
        lastUpdated: latest.date,
    };
}

// ==== 4. ArcGIS API 呼び出し ====
async function fetchGarbageData(): Promise<
    { date: string; year: number; amountTon: number; type: string }[]
> {
    const params = new URLSearchParams({
        where: `年=${THIS_YEAR}`,
        outFields: "*",
        f: "json",
    });
    const res = await fetch(`${API_URL}?${params}`);
    if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);
    const json = await res.json();

    return json.features.map((f: any) => ({
        date: f.attributes["日付"], // 例: "2015/4/1"
        year: Number(f.attributes["年"]),
        amountTon: Number(f.attributes["ごみ収集量_ton"]),
        type: f.attributes["ごみ種類"],
    }));
}
