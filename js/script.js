let data;
let currentScene = 0;
let scenes;

const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#visualization").select("#chartArea")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// const listSvgWidth = 400;
// const listSvgHeight = 600;

// const listSvg = d3.select("#visualization").select("#jobTitleList")

// Add initial text to the listSvg. This will be changed based on interaction.
document.getElementById("jobTitleList").textContent = "Default text for the scene.";


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

    document.getElementById("jobTitleList").textContent = "Default text for the scene.";


    if (currentScene === 3) {
        console.log("got here")
        document.getElementById('experienceDropdown').style.display = 'block';
    } else {
        document.getElementById('experienceDropdown').style.display = 'none';
    }


    scenes[currentScene](data);
    updateButtonStates();
}

function updateButtonStates() {
    prevButton.disabled = currentScene === 0;
    nextButton.disabled = currentScene === scenes.length - 1;
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

// function computeJobLevelPercentages(data, remoteStatus) {
//     const ratioMapping = {
//         "No Remote Work": 0,
//         "Partially Remote": 50,
//         "Fully Remote": 100
//     };

//     // Filter data for the given remote status
//     const filteredData = data.filter(d => d.remote_ratio === remoteStatus);

//     console.log(`Data for remoteStatus ${remoteStatus}:`, filteredData);
//     // Count occurrences for each job level
//     const levelCounts = {};
//     filteredData.forEach(d => {
//         if (levelCounts[d.experience_level]) {
//             levelCounts[d.experience_level]++;
//         } else {
//             levelCounts[d.experience_level] = 1;
//         }
//     });

//     // Convert counts to percentages
//     const total = filteredData.length;
//     const levelPercentages = Object.keys(levelCounts).map(level => {
//         return {
//             level: level,
//             percentage: ((levelCounts[level] / total) * 100).toFixed(2)
//         };
//     });

//     // Sort by percentage for consistent ordering
//     levelPercentages.sort((a, b) => b.percentage - a.percentage);

//     return levelPercentages;
// }

function computeJobLevelPercentages(data, remoteStatus) {
    // Filter data based on remote status
    // console.log(data)
    console.log(remoteStatus)
    const filteredData = data.filter(d => d.remote_ratio === remoteStatus);
    console.log(filteredData)
        // Compute percentages for different job levels
        // Again, this is a hypothetical example and might need adjustments.
    const totalEntries = filteredData.length;
    const entryLevelCount = filteredData.filter(d => d.experience_level === 'EN').length;
    const midLevelCount = filteredData.filter(d => d.experience_level === 'MI').length;
    const seniorLevelCount = filteredData.filter(d => d.experience_level === 'SE').length;
    const managerCount = filteredData.filter(d => d.experience_level === 'EX').length;
    console.log(entryLevelCount, midLevelCount, seniorLevelCount, managerCount, totalEntries)

    return [
        { title: 'Entry Level', percentage: `${(entryLevelCount / totalEntries * 100).toFixed(2)}%` },
        { title: 'Mid Level', percentage: `${(midLevelCount / totalEntries * 100).toFixed(2)}%` },
        { title: 'Senior Level', percentage: `${(seniorLevelCount / totalEntries * 100).toFixed(2)}%` },
        { title: 'Manager/Director', percentage: `${(managerCount / totalEntries * 100).toFixed(2)}%` }
    ];
}


// ... [Rest of your code for drawScene1, drawScene2, drawScene3]


function drawScene1(data) {
    svg.selectAll("*").remove();
    // listSvg.select("#defaultListText").text("Click on a bar to see the distribution of the most \\n common jobs for that salary range.");
    document.getElementById("jobTitleList").textContent = "Click on a bar to see the distribution of the most common jobs for that salary range in 2023!";


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
            console.log(topJobTitles)
                // Render them on the SVG
                // renderJobTitles(topJobTitles);
                // Select the container
            const jobTitleContainer = d3.select("#jobTitleList");
            jobTitleContainer.node().innerHTML = "";
            // Bind the data and create divs for each job title
            const jobDivs = jobTitleContainer.selectAll("div")
                .data(topJobTitles)
                .join("div")
                .attr("class", "jobDiv") // Add a class for styling, if required
                .text(d => `${d.title} (${d.frequency}%)`); // Display the title and frequency together
        });
}

function drawScene2(data) {
    svg.selectAll("*").remove();
    document.getElementById("jobTitleList").textContent = "Click on a bar to see job level percentages for that remote status!";

    // console.log(data.filter(d => d.remote_ratio === '0'));

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
                "No Remote Work": '0',
                "Partially Remote": '50',
                "Fully Remote": '100'
            };

            const levelPercentages = computeJobLevelPercentages(data, ratioMapping[d.remoteStatus]);
            // Clear existing content
            d3.select("#jobTitleList").node().innerHTML = "";

            // Render the new percentages
            d3.select("#jobTitleList")
                .selectAll("div")
                .data(levelPercentages)
                .enter()
                .append("div")
                .text(d => `${d.title}: ${d.percentage}`);
            // renderJobLevelPercentages(levelPercentages);
        });
}


function drawScene3(data, experienceLevel = "EN") {
    svg.selectAll("*").remove();
    document.getElementById('experienceDropdown').style.display = 'block';
    document.getElementById("jobTitleList").textContent = "Use the dropdown to see salary trends for AI/ML Professionals of different levels of experience!";

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