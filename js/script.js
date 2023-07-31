let data;
let currentScene = 0;
let scenes;

const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const listSvgWidth = 400;
const listSvgHeight = 600;

// Use this SVG for the job titles list on the right side.
// const listSvg = d3.select("#visualization")
//     .append("svg")
//     .attr("id", "jobTitleList")
//     .attr("width", listSvgWidth)
//     .attr("height", listSvgHeight)
//     .attr("x", width + margin.left + margin.right + 20); // 20px gap between main SVG and list SVG

const listSvg = d3.select("#visualization").select("#jobTitleList")

// Add initial text to the listSvg. This will be changed based on interaction.
listSvg.append("text")
    .attr("x", 10)
    .attr("y", 20)
    .attr("font-size", "16px")
    .attr("id", "defaultListText")
    .text("Default text for the scene.");

const prevButton = document.getElementById('prevScene');
const nextButton = document.getElementById('nextScene');

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

nextButton.addEventListener('click', function() {
    currentScene = (currentScene + 1) % scenes.length;
    drawScene();
    updateButtonStates();
});

prevButton.addEventListener('click', function() {
    currentScene = (currentScene - 1 + scenes.length) % scenes.length;
    drawScene();
    updateButtonStates();
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

    listSvg.selectAll("text").remove(); // Clear previous details
    listSvg.append("text") // Add default message
        .attr("id", "defaultListText")
        .attr("x", 10)
        .attr("y", 30)
        .attr("font-size", "16px")
        .text("Details will appear here...");


    scenes[currentScene](data);
    updateButtonStates();
}

function updateButtonStates() {
    prevButton.disabled = currentScene === 0;
    nextButton.disabled = currentScene === scenes.length - 1;
}

function renderJobTitles(jobTitles) {
    // Update existing text elements
    const texts = listSvg.selectAll("text")
        .data(jobTitles);

    texts.enter() // For any additional data points
        .append("text")
        .attr("x", 10)
        .attr("font-size", "16px")
        .merge(texts) // Combine enter and update selections
        .attr("y", (d, i) => 20 + (i * 30))
        .text(d => `${d.title}: ${d.frequency}%`);

    texts.exit().remove(); // Remove excess text elements if any
}


function computeTopJobTitles(dataRange) {
    const jobTitles = d3.group(dataRange, d => d.job_title);
    const sortedTitles = Array.from(jobTitles, ([key, value]) => ({ title: key, count: value.length }))
        .sort((a, b) => b.count - a.count);

    const total = d3.sum(sortedTitles, d => d.count);
    const top5 = sortedTitles.slice(0, 5);
    const otherCount = total - d3.sum(top5, d => d.count);

    if (otherCount > 0) {
        top5.push({ title: 'Other', count: otherCount });
    }

    return top5.map(d => ({
        title: d.title,
        frequency: (d.count / total * 100).toFixed(2)
    }));
}

function renderJobLevelPercentages(levelPercentages) {
    const texts = listSvg.selectAll("text")
        .data(levelPercentages);

    texts.enter()
        .append("text")
        .attr("x", 10)
        .attr("font-size", "16px")
        .merge(texts)
        .attr("y", (d, i) => 20 + (i * 30))
        .text(d => `${d.level}: ${d.percentage}%`);

    texts.exit().remove();
}


function computeJobLevelPercentages(data, remoteStatus) {
    const ratioMapping = {
        "No Remote Work": 0,
        "Partially Remote": 50,
        "Fully Remote": 100
    };

    // Filter data for the given remote status
    const filteredData = data.filter(d => d.remote_ratio === remoteStatus);

    console.log(`Data for remoteStatus ${remoteStatus}:`, filteredData);
    // Count occurrences for each job level
    const levelCounts = {};
    filteredData.forEach(d => {
        if (levelCounts[d.experience_level]) {
            levelCounts[d.experience_level]++;
        } else {
            levelCounts[d.experience_level] = 1;
        }
    });

    // Convert counts to percentages
    const total = filteredData.length;
    const levelPercentages = Object.keys(levelCounts).map(level => {
        return {
            level: level,
            percentage: ((levelCounts[level] / total) * 100).toFixed(2)
        };
    });

    // Sort by percentage for consistent ordering
    levelPercentages.sort((a, b) => b.percentage - a.percentage);

    return levelPercentages;
}


// ... [Rest of your code for drawScene1, drawScene2, drawScene3]


function drawScene1(data) {
    svg.selectAll("*").remove();
    listSvg.select("#defaultListText").text("Click on a bar for more details.");

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
        .attr("height", d => height - yScale(d.length))
        .on("click", function(event, d) {
            // Fetch the data range for the clicked bar
            const salariesRange = yearData.filter(data => data.salary_in_usd >= d.x0 && data.salary_in_usd < d.x1);

            // Compute the top 5 job titles
            const topJobTitles = computeTopJobTitles(salariesRange);

            // Render them on the SVG
            renderJobTitles(topJobTitles);
        });
}

function drawScene2(data) {
    svg.selectAll("*").remove();
    listSvg.select("#defaultListText").text("Click on a bar to see job level percentages.");

    const yearData = data.filter(d => d.work_year === 2023);
    const remoteStatusesLabels = ["No Remote Work", "Partially Remote", "Fully Remote"];

    // console.log('Year data:', yearData);

    const remoteStatuses = [
        { ratio: 0, label: "No Remote Work" },
        { ratio: 50, label: "Partially Remote" },
        { ratio: 100, label: "Fully Remote" },
    ];

    const avgSalaries = remoteStatuses.map(status => {
        const salaries = yearData.filter(d => d.remote_ratio == status.ratio).map(d => d.salary_in_usd);
        const avgSalary = d3.mean(salaries);
        return { remoteStatus: status.label, avgSalary };
    });

    // console.log(avgSalaries)

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(remoteStatusesLabels)
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
        .attr("x", d => xScale(d.remoteStatus))
        .attr("y", d => yScale(d.avgSalary))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.avgSalary))
        .on("click", function(event, d) {
            console.log("button clicked")
            const ratioMapping = {
                "No Remote Work": 0,
                "Partially Remote": 50,
                "Fully Remote": 100
            };

            const levelPercentages = computeJobLevelPercentages(data, d.remoteStatus);
            renderJobLevelPercentages(levelPercentages);
        });
}


function drawScene3(data, experienceLevel = "EN") {
    svg.selectAll("*").remove();
    listSvg.select("#defaultListText").text("Information on experience levels.");

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