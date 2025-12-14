import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Chart } from "react-google-charts";

const Dashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & Sort States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUrgency, setFilterUrgency] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    useEffect(() => {
        const q = query(collection(db, "complaints"), orderBy("created_at", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComplaints(docs);
            setLoading(false);
        }, (err) => {
            console.error("Firestore error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Derived Data for Charts
    const categoryData = [["Category", "Count"]];
    const cats = {};
    const uniqueCategories = new Set(['All']);

    complaints.forEach(c => {
        const cat = c.category || "Uncategorized";
        cats[cat] = (cats[cat] || 0) + 1;
        uniqueCategories.add(cat);
    });
    Object.keys(cats).forEach(k => categoryData.push([k, cats[k]]));

    const urgencyData = [["Urgency", "Count"]];
    const urgs = {};
    complaints.forEach(c => {
        const u = c.urgency || "Unknown";
        urgs[u] = (urgs[u] || 0) + 1;
    });
    Object.keys(urgs).forEach(k => urgencyData.push([k, urgs[k]]));

    // Coffee Shop Palette for Charts
    const chartOptions = {
        backgroundColor: 'transparent',
        legend: { textStyle: { color: '#402E29', fontName: 'sans-serif' } },
        titleTextStyle: { color: '#734026', fontName: 'serif', fontSize: 18 },
        pieSliceBorderColor: 'transparent',
        colors: ['#734026', '#CDAD8F', '#DBC7B8', '#8F9172', '#A64D3F'],
        fontName: 'sans-serif',
    };

    // Sorting Logic
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Processing Logic
    const getProcessedComplaints = () => {
        let processed = [...complaints];

        // 1. Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            processed = processed.filter(c =>
                (c.summary && c.summary.toLowerCase().includes(lowerTerm)) ||
                (c.complaint_text && c.complaint_text.toLowerCase().includes(lowerTerm)) ||
                (c.category && c.category.toLowerCase().includes(lowerTerm))
            );
        }
        if (filterUrgency !== 'All') {
            processed = processed.filter(c => c.urgency === filterUrgency);
        }
        if (filterCategory !== 'All') {
            processed = processed.filter(c => c.category === filterCategory);
        }

        // 2. Sort
        if (sortConfig.key) {
            processed.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Special handling for Urgency (High > Medium > Low)
                if (sortConfig.key === 'urgency') {
                    const urgencyOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    aValue = urgencyOrder[aValue] || 0;
                    bValue = urgencyOrder[bValue] || 0;
                }

                // Handle dates/timestamps
                if (sortConfig.key === 'created_at' || sortConfig.key === 'timestamp') {
                    aValue = a.created_at || a.timestamp || 0;
                    bValue = b.created_at || b.timestamp || 0;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return processed;
    };

    const displayComplaints = getProcessedComplaints();

    return (
        <div className="container mx-auto px-4 pb-12">
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-primary">
                        Admin Dashboard
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Overview of campus feedback and AI insights
                    </p>
                </div>

                <div className="bg-card px-6 py-3 rounded-full shadow-sm border border-border flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Issues</span>
                    <span className="text-2xl font-bold text-primary">{complaints.length}</span>
                </div>
            </header>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-card p-6 rounded-xl shadow-md border border-border/50">
                    <h3 className="text-lg font-serif font-semibold text-primary mb-4 pb-2 border-b border-border">Issue Categories</h3>
                    {categoryData.length > 1 ? (
                        <Chart
                            chartType="PieChart"
                            data={categoryData}
                            options={{ ...chartOptions, pieHole: 0.4 }}
                            width={"100%"}
                            height={"300px"}
                        />
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data yet</div>
                    )}
                </div>
                <div className="bg-card p-6 rounded-xl shadow-md border border-border/50">
                    <h3 className="text-lg font-serif font-semibold text-primary mb-4 pb-2 border-b border-border">Urgency Distribution</h3>
                    {urgencyData.length > 1 ? (
                        <Chart
                            chartType="ColumnChart"
                            data={urgencyData}
                            options={{ ...chartOptions, legend: { position: "none" } }}
                            width={"100%"}
                            height={"300px"}
                        />
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data yet</div>
                    )}
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center bg-card p-4 rounded-xl shadow-sm border border-border/50">
                <input
                    type="text"
                    placeholder="Search complaints..."
                    className="flex-1 p-2 bg-muted/30 border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    className="p-2 bg-muted/30 border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                >
                    <option value="All">All Urgencies</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>

                <select
                    className="p-2 bg-muted/30 border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    {Array.from(uniqueCategories).map(cat => (
                        <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                    ))}
                </select>
                <div className="text-xs text-muted-foreground ml-2">
                    Showing {displayComplaints.length} of {complaints.length}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-xl shadow-md border border-border/50 overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-serif font-semibold text-primary">Recent Activity</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-muted/30">
                            <tr>
                                <th onClick={() => handleSort('urgency')} className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none">
                                    Urgency {sortConfig.key === 'urgency' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('created_at')} className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none">
                                    Time {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => handleSort('category')} className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-primary transition-colors select-none">
                                    Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Summary</th>
                                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Suggested Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {displayComplaints.map(c => (
                                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${c.urgency === 'High' ? 'bg-destructive/10 text-destructive' :
                                                c.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'}`}>
                                            {c.urgency}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {c.created_at ? new Date(c.created_at).toLocaleString() : new Date(c.timestamp).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-sm font-medium text-foreground">
                                        {c.category}
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground max-w-xs truncate" title={c.summary || c.complaint_text}>
                                        {c.summary || c.complaint_text}
                                    </td>
                                    <td className="p-4 text-sm text-primary font-medium">
                                        {c.suggested_action}
                                    </td>
                                </tr>
                            ))}
                            {displayComplaints.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-muted-foreground">
                                        No complaints match your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
