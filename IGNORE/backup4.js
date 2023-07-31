let data;
let currentScene = 0;
let scenes;

const margin = {top: 50, right: 50, bottom: 50, left: 50};
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv('data/salaries.csv').then(rawData => {
    data = rawData.map(d => ({
        ...d,
        work_year: +d.work_year,
        salary_in_usd: +d.salary_in_usd,
    }));

    scenes = [drawScene1, drawScene2, drawScene3];
    populateDropdown();
    drawScene();
});

document.getElementById('nextScene').addEventListener('click', function() {
    currentScene = (currentScene + 1) % scenes.length;
    drawScene();
});

document.getElementById('prevScene').addEventListener('click', function() {
    currentScene = (currentScene - 1 + scenes.length) % scenes.length;
    drawScene();
});

function populateDropdown() {
    const experienceLevels = Array.from(new Set(data.map(d => d.experience_level)));
    const dropdown = document.getElementById("experienceDropdown");
    experienceLevels.forEach(level => {
        const option = document.createElement("option");
        option.value = level;
        option.textContent = level;
        dropdown.appendChild(option);
    });

    dropdown.addEventListener("change", function() {
        if (currentScene === 2) {
            drawScene3(data, this.value);
        }
    });
}

function drawScene() {
    scenes[currentScene](data);
}

function drawScene1(data) {
    svg.selectAll("*").remove();

    const yearData = data.filter(d => d.work_year === 2023);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(yearData, d => d.salary_in_usd)])
        .range([0, width]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    const histogram = d3.histogram()
        .value(d => d.salary_in_usd)
        .domain(xScale.domain())
        .thresholds(xScale.ticks(50));

    const bins = histogram(yearData);

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(bins, d => d.length)]);

    svg.append("g")
        .call(d3.axisLeft(yScale));

    svg.selectAll("rect")
        .data(bins)
        .enter().append("rect")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.length))
        .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
        .attr("height", d => height - yScale(d.length));
}

function drawScene2(data) {
    svg.selectAll("*").remove();

    const yearData = data.filter(d => d.work_year === 2023);
    const experienceLevels = Array.from(new Set(yearData.map(d => d.experience_level)));

    const avgSalaries = experienceLevels.map(level => {
        const salaries = yearData.filter(d => d.experience_level === level).map(d => d.salary_in_usd);
        const avgSalary = d3.mean(salaries);
        return { level, avgSalary };
    });

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(experienceLevels)
        .padding(0.4);

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(avgSalaries, d => d.avgSalary)]);

    svg.append("g")
        .call(d3.axisLeft(yScale));

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg.selectAll(".bar")
        .data(avgSalaries)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.level))
        .attr("y", d => yScale(d.avgSalary))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.avgSalary));
}

function drawScene3(data, experienceLevel = "EN") {
    svg.selectAll("*").remove();

    const levelData = data.filter(d => d.experience_level === experienceLevel);
    const years = Array.from(new Set(levelData.map(d => +d.work_year))); // Convert string to number using '+'

    const avgSalaries = years.map(year => {
        const salaries = levelData.filter(d => +d.work_year === year).map(d => d.salary_in_usd); // Convert string to number using '+'
        const avgSalary = d3.mean(salaries);
        return { year, avgSalary };
    });

    // Sort avgSalaries by year
    avgSalaries.sort((a, b) => a.year - b.year);

    const xScale = d3.scaleLinear()
        .range([0, width])
        .domain(d3.extent(years));

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(avgSalaries, d => d.avgSalary)]);

    svg.append("g")
        .call(d3.axisLeft(yScale));

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).ticks(years.length)); // This will ensure one tick per year

    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.avgSalary));

    svg.append("path")
        .data([avgSalaries])
        .attr("class", "line")
        .attr("d", line);
}