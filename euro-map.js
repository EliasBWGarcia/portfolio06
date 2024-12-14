// Nedenstående er med hjælp fra chatGPT:

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded");
    drawD3Map();
});

async function drawD3Map() {
    console.log("Drawing map...");

    try {
        // Fetch data from your API
        const response = await fetch('http://localhost:3000/getData/category/map');
        const results = await response.json();
        console.log("Data fetched from API:", results);

        const data = results.map(d => ({
            country: d.country,
            value: +d.total_posts_for_ukraine,
            interactions: +d.total_interactions
        }));
        console.log("Processed data:", data);

        // Load world GeoJSON
        const geoResponse = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
        const world = await geoResponse.json();

        // Create a mapping from your data countries to ADMIN names
        const countryMapping = {
            Germany: 'Germany',
            France: 'France',
            Denmark: 'Denmark',
            Schweiz: 'Switzerland',
            Malta: 'Malta',
            Wales: 'United Kingdom'
        };

        // Show all countries because there's no CONTINENT info in this dataset
        const features = world.features;

        // Merge data into GeoJSON
        for (const f of features) {
            const matched = data.find(d => countryMapping[d.country] === f.properties.ADMIN) || { value: 0, interactions: 0 };
            f.properties.value = matched.value;
            f.properties.interactions = matched.interactions;
        }

        // Compute min/max values
        const values = features.map(f => f.properties.value);
        const minValue = d3.min(values);
        const maxValue = d3.max(values);

        console.log("Min value:", minValue, "Max value:", maxValue);

        const colorScale = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range(["#ADD8E6", "#00008B"]);

        const mapDiv = document.getElementById('map');
        const width = mapDiv.clientWidth;
        const height = mapDiv.clientHeight;
        console.log("Map dimensions:", width, height);

        // Instead of fitSize, manually center and scale to Europe
        // Europe roughly: center on [10, 50], scale ~500
        const projection = d3.geoMercator()
            .center([10, 50])
            .scale(500)
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        const svg = d3.select("#map")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const tooltip = d3.select("#tooltip");

        svg.selectAll("path")
            .data(features)
            .join("path")
            .attr("d", path)
            .attr("fill", d => {
                return d.properties.value > 0 ? colorScale(d.properties.value) : '#ccc';
            })
            .attr("stroke", "#333")
            .on("mousemove", (event, d) => {
                const { ADMIN, value, interactions } = d.properties;
                tooltip
                    .style("display", "block")
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px")
                    .html(`
                        <strong>${ADMIN}</strong><br/>
                        Posts: ${value}<br/>
                        Interactions: ${interactions}
                    `);
            })
            .on("mouseout", () => {
                tooltip.style("display", "none");
            });

        console.log("Map rendered. All countries shown; focusing on Europe's area.");
    } catch (error) {
        console.error('Error fetching data or rendering map:', error);
    }
}