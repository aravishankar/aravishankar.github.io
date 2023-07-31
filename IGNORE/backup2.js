d3.csv("data/salaries.csv").then(data => {
    document.getElementById("overview").addEventListener("click", () => {
        drawOverview(data);
    });

    document.getElementById("detail1").addEventListener("click", () => {
        drawDetail1(data);
    });

    document.getElementById("detail2").addEventListener("click", () => {
        drawDetail2(data);
    });

    // By default, display the overview
    drawOverview(data);
});

function drawOverview(data) {
    const svg = d3.select("#visualization");
    svg.html(""); // Clear any existing visuals

    const groupedData = d3.rollups(
        data, 
        values => d3.mean(values, d => +d.salary_in_usd),
        d => d.experience_level
    ).map(([key, value]) => ({experience_level: key, average_salary: value}));

    const xScale = d3.scaleBand()
        .domain(groupedData.map(d => d.experience_level))
        .range([50, 550])
        .padding(0.2);
        
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d.average_salary)])
        .range([350, 50]);

    svg.selectAll("rect")
        .data(groupedData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.experience_level))
        .attr("y", d => yScale(d.average_salary))
        .attr("width", xScale.bandwidth())
        .attr("height", d => 350 - yScale(d.average_salary))
        .attr("fill", "skyblue");

    const xAxis = d3.axisBottom(xScale);
    svg.append("g").attr("transform", "translate(0, 350)").call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    svg.append("g").attr("transform", "translate(50, 0)").call(yAxis);
}


function drawOverview(data) {
    const svg = d3.select("#visualization");
    svg.html(""); // Clear any existing visuals

    const groupedData = d3.rollups(
        data, 
        values => d3.mean(values, d => +d.salary_in_usd),
        d => d.experience_level
    ).map(([key, value]) => ({experience_level: key, average_salary: value}));

    const xScale = d3.scaleBand()
        .domain(groupedData.map(d => d.experience_level))
        .range([50, 550])
        .padding(0.2);
        
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d.average_salary)])
        .range([350, 50]);

    svg.selectAll("rect")
        .data(groupedData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.experience_level))
        .attr("y", d => yScale(d.average_salary))
        .attr("width", xScale.bandwidth())
        .attr("height", d => 350 - yScale(d.average_salary))
        .attr("fill", "skyblue");

    const xAxis = d3.axisBottom(xScale);
    svg.append("g").attr("transform", "translate(0, 350)").call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    svg.append("g").attr("transform", "translate(50, 0)").call(yAxis);
}

function drawDetail1(data) {
    const svg = d3.select("#visualization");
    svg.html(""); // Clear any existing visuals

    const groupedData = d3.rollups(
        data, 
        values => d3.mean(values, d => +d.salary_in_usd),
        d => d.employment_type
    ).map(([key, value]) => ({employment_type: key, average_salary: value}));

    const xScale = d3.scaleBand()
        .domain(groupedData.map(d => d.employment_type))
        .range([50, 550])
        .padding(0.2);
        
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d.average_salary)])
        .range([350, 50]);

    svg.selectAll("rect")
        .data(groupedData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.employment_type))
        .attr("y", d => yScale(d.average_salary))
        .attr("width", xScale.bandwidth())
        .attr("height", d => 350 - yScale(d.average_salary))
        .attr("fill", "lightgreen");

    const xAxis = d3.axisBottom(xScale);
    svg.append("g").attr("transform", "translate(0, 350)").call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    svg.append("g").attr("transform", "translate(50, 0)").call(yAxis);
}

function drawDetail2(data) {
    const svg = d3.select("#visualization");
    svg.html(""); // Clear any existing visuals

    const groupedData = d3.rollups(
        data, 
        values => values.length,
        d => d.remote_ratio
    ).map(([key, value]) => ({remote_ratio: key, count: value}));

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const pie = d3.pie().value(d => d.count);
    const arc = d3.arc().innerRadius(0).outerRadius(150);

    const pieChart = svg.selectAll(".arc")
        .data(pie(groupedData))
        .enter()
        .append("g")
        .attr("transform", "translate(300, 200)")
        .attr("class", "arc");

    pieChart.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.remote_ratio));

    pieChart.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(d => d.data.remote_ratio);
}

