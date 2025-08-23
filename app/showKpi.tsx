// app/kpi/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getKPIShibuya } from "@/lib/kpi";

type WasteData = {
    household_gpd: number;
    delta_household: number;
    lastUpdated: string;
};

export default function ShibuyaKPIPage() {
    const [data, setData] = useState<WasteData>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getKPIShibuya().then((res) => {
            console.log(res);
            setData(res);
            setLoading(false);
        });
    }, []);

    if (loading) return <p className="p-4">Loading...</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">渋谷区ごみ収集データ</h1>
            <table className="table-auto border-collapse border border-gray-300 w-full">
                <thead>
                    <tr>
                        <th className="border border-gray-300 px-4 py-2">最新収集日</th>
                        <th className="border border-gray-300 px-4 py-2">ごみ量 (g/人・日)</th>
                        <th className="border border-gray-300 px-4 py-2">前回との差分 (g/人・日)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr key={0}>
                        <td className="border border-gray-300 px-4 py-2">{data.lastUpdated}</td>
                        <td className="border border-gray-300 px-4 py-2">{Math.round(data.household_gpd)}</td>
                        <td className="border border-gray-300 px-4 py-2">{Math.round(data.delta_household)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
