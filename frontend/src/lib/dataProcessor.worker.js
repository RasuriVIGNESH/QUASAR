/**
 * Data Processor Web Worker
 * 
 * Handles heavy computations off the main thread:
 * - Complex filtering of large lists
 * - Data transformations and mapping
 * - Statistical calculations
 */

self.onmessage = function (e) {
    const { type, payload } = e.data;

    switch (type) {
        case 'FILTER_PROJECTS':
            const { projects, query, category } = payload;
            const filtered = projects.filter(p => {
                const matchesQuery = !query ||
                    p.title?.toLowerCase().includes(query.toLowerCase()) ||
                    p.description?.toLowerCase().includes(query.toLowerCase());

                const matchesCategory = !category || category === 'All' ||
                    p.categoryName === category || p.category?.name === category;

                return matchesQuery && matchesCategory;
            });
            self.postMessage({ type: 'FILTER_PROJECTS_RESULT', data: filtered });
            break;

        case 'PROCESS_STATS':
            // Example of heavy statistical processing
            const { data } = payload;
            const stats = {
                total: data.length,
                categories: {},
                activeProjects: 0
            };

            data.forEach(item => {
                const cat = item.categoryName || 'Other';
                stats.categories[cat] = (stats.categories[cat] || 0) + 1;
                if (item.status === 'ACTIVE' || item.status === 'RECRUITING') stats.activeProjects++;
            });

            self.postMessage({ type: 'PROCESS_STATS_RESULT', data: stats });
            break;

        default:
            self.postMessage({ type: 'ERROR', message: 'Unknown action type' });
    }
};
