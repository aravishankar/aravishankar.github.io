d3.csv("data/salaries.csv").then(data => {
    // Ensure data is loaded correctly
    console.log(data);

    const width = 800;
    const height = 500;
    const margin = {top: 40, right: 20, bottom: 60, left: 60};

    const svg = d3.select("#canvas");

    // Apply the rollups function
    const groupedData = d3.rollups(
        data, 
        values => d3.mean(values, d => +d.salary_in_usd), // ensure salary is treated as a number
        d => d.experience_level
    ).map(([key, value]) => ({
        experience_level: key, 
        average_salary: value
    }));

    console.log(groupedData);

    const xScale = d3.scaleBand()
    .domain(groupedData.map(d => d.experience_level))
    .range([margin.left, width - margin.right])
    .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d.average_salary)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Bars
    svg.selectAll("rect")
        .data(groupedData)
        .enter().append("rect")
        .attr("x", d => xScale(d.experience_level))
        .attr("y", d => yScale(d.average_salary))
        .attr("height", d => yScale(0) - yScale(d.average_salary))
        .attr("width", xScale.bandwidth())
        .attr("fill", "steelblue");

    // X-axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    // Y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

});

// const data = d3.csv("data/salaries.csv").then(data => {
//     console.log(data);
// });

// const width = 800;
// const height = 500;
// const margin = {top: 40, right: 20, bottom: 60, left: 60};

// const svg = d3.select("#canvas");

// // Group data by experience_level and calculate average salary
// const groupedData = d3.rollups(
//     data,
//     v => d3.mean(v, d => d.salary_in_usd),
//     d => d.experience_level
// ).map(([key, value]) => ({experience_level: key, average_salary: value}));

// console.log(groupedData);

// const xScale = d3.scaleBand()
//     .domain(groupedData.map(d => d.experience_level))
//     .range([margin.left, width - margin.right])
//     .padding(0.1);

// const yScale = d3.scaleLinear()
//     .domain([0, d3.max(groupedData, d => d.average_salary)])
//     .nice()
//     .range([height - margin.bottom, margin.top]);

// // Bars
// svg.selectAll("rect")
//     .data(groupedData)
//     .enter().append("rect")
//     .attr("x", d => xScale(d.experience_level))
//     .attr("y", d => yScale(d.average_salary))
//     .attr("height", d => yScale(0) - yScale(d.average_salary))
//     .attr("width", xScale.bandwidth())
//     .attr("fill", "steelblue");

// // X-axis
// svg.append("g")
//     .attr("transform", `translate(0,${height - margin.bottom})`)
//     .call(d3.axisBottom(xScale));

// // Y-axis
// svg.append("g")
//     .attr("transform", `translate(${margin.left},0)`)
//     .call(d3.axisLeft(yScale));

// // Title and labels... (to be added)

