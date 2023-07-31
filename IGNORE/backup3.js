let currentScene = 0;
const scenes = [
    drawScene1,
    drawScene2,
    drawScene3
];

d3.csv("data/salaries.csv").then(data => {
    // Convert to appropriate types
    data.forEach(d => {
        d.salary_in_usd = +d.salary_in_usd;
    });
    
    drawScene1(data);
    
    // Scene navigation
    d3.select("#nextScene").on("click", () => {
        currentScene = (currentScene + 1) % scenes.length;
        scenes[currentScene](data);
    });

    d3.select("#prevScene").on("click", () => {
        currentScene = (currentScene - 1 + scenes.length) % scenes.length;
        scenes[currentScene](data);
    });
});

function drawScene1(data) {
    const svg = d3.select("#visualization").html("").append("svg").attr("width", 500).attr("height", 400);

    // Calculate the average salary by experience level
    const averages = d3.rollups(
        data, 
        v => d3.mean(v, d => d.salary_in_usd), 
        d => d.experience_level
    );

    const xScale = d3.scaleBand()
        .domain(averages.map(d => d[0]))
        .range([50, 450])
        .padding(0.1);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(averages, d => d[1])])
        .range([350, 50]);

    svg.selectAll("rect")
        .data(averages)
        .enter().append("rect")
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => 350 - yScale(d[1]))
        .attr("fill", "steelblue");

    svg.append("g")
        .attr("transform", "translate(0, 350)")
        .call(d3.axisBottom(xScale));
        
    svg.append("g")
        .attr("transform", "translate(50, 0)")
        .call(d3.axisLeft(yScale));
}

function drawScene2(data) {
    const svg = d3.select("#visualization").html("").append("svg").attr("width", 500).attr("height", 400);
    const radius = Math.min(500, 400) / 2 - 40;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Calculate the distribution of employment types
    const distribution = d3.rollups(
        data, 
        v => v.length, 
        d => d.employment_type
    );

    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const arcs = svg.selectAll(".arc")
        .data(pie(distribution))
        .enter().append("g")
        .attr("class", "arc")
        .attr("transform", `translate(${500 / 2}, ${400 / 2})`);

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data[0]));
    
    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .text(d => d.data[0])
        .attr("fill", "white");
}

function expandExperience(abbreviation) {
    switch (abbreviation) {
        case 'EN':
            return 'Entry-level / Junior';
        case 'MI':
            return 'Mid-level / Intermediate';
        case 'SE':
            return 'Senior-level / Expert';
        case 'EX':
            return 'Executive-level / Director';
        default:
            return abbreviation; // Return the abbreviation if there's no match
    }
}

function drawScene3(data) {
    // Clear any existing visuals
    d3.select("#visualization").html("");

    const width = 700;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const svg = d3.select("#visualization")
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);

    const years = Array.from(new Set(data.map(d => d.year)));

    const nestedData = d3.group(data, d => d.year);

    const xScale = d3.scalePoint()
                     .domain(years)
                     .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
                     .domain([d3.min(data, d => d.salary), d3.max(data, d => d.salary)])
                     .nice()
                     .range([height - margin.bottom, margin.top]);

    svg.append("g")
       .attr("transform", `translate(0,${height - margin.bottom})`)
       .call(d3.axisBottom(xScale));

    svg.append("g")
       .attr("transform", `translate(${margin.left},0)`)
       .call(d3.axisLeft(yScale));

    function updateChart(experience) {
        svg.selectAll(".line").remove();

        const lineData = years.map(year => {
            const yearMap = new Map(nestedData.get(year).map(d => [d.experience, d.salary]));
            return [year, yearMap.get(experience)];
        });

        const line = d3.line()
                       .x(d => xScale(d[0]))
                       .y(d => yScale(d[1]));

        svg.append("path")
           .datum(lineData)
           .attr("fill", "none")
           .attr("stroke", "#33FF57")
           .attr("stroke-width", 1.5)
           .attr("class", "line")
           .attr("d", line);
    }

    d3.select("#experienceDropdown")
      .on("change", function() {
          updateChart(this.value);
      });

    // Initial render for the first experience
    updateChart('EN');
}






// function drawScene3(data) {
//     const svg = d3.select("#visualization").html("").append("svg").attr("width", 500).attr("height", 400);

//     // Calculate average salaries over the years (just for demonstration purposes, assuming the dataset spans multiple years)
//     const yearlyAverages = d3.rollups(
//         data, 
//         v => d3.mean(v, d => d.salary_in_usd), 
//         d => d.work_year
//     ).sort((a, b) => d3.ascending(a[0], b[0]));

//     const xScale = d3.scaleLinear()
//         .domain(d3.extent(yearlyAverages, d => d[0]))
//         .range([50, 450]);
    
//     const yScale = d3.scaleLinear()
//         .domain([0, d3.max(yearlyAverages, d => d[1])])
//         .range([350, 50]);

//     const line = d3.line()
//         .x(d => xScale(d[0]))
//         .y(d => yScale(d[1]));

//     svg.append("path")
//         .datum(yearlyAverages)
//         .attr("fill", "none")
//         .attr("stroke", "steelblue")
//         .attr("stroke-width", 2)
//         .attr("d", line);
    
//     svg.append("g")
//         .attr("transform", "translate(0, 350)")
//         .call(d3.axisBottom(xScale).ticks(yearlyAverages.length).tickFormat(d3.format("d")));
        
//     svg.append("g")
//         .attr("transform", "translate(50, 0)")
//         .call(d3.axisLeft(yScale));
// }

