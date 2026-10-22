
const container = document.getElementById("pathsTree");

// Normalize keys: "sect 350" becomes "350".
const sections = {};
for (const [key, links] of Object.entries(graphData)) {
    const id = String(key).match(/\d+/)?.[0];
    if (id) {
        sections[id] = Array.isArray(links) ? links : [];
    }
}
const rootSection = "1";
const nodes = {};
const edges = [];

// Extract child IDs from hrefs.
function getChildren(section) {
    return (graphData[section] || [])
        .map(href => href.match(/^sect\s*(\d+)\.htm$/i)?.[1])
        .filter(id => id && graphData[id] !== undefined);
}

// Find reachable sections.
const depths = { [rootSection]: 0 };
const queue = [rootSection];
for (let i = 0; i < queue.length; i++) {
    const parent = queue[i];
    for (const child of getChildren(parent)) {
        edges.push([parent, child]);

        if (depths[child] === undefined) {
            depths[child] = depths[parent] + 1;
            queue.push(child);
        }
    }
}

// Group nodes by depth.
const columns = {};
for (const [section, depth] of Object.entries(depths)) {
    (columns[depth] ||= []).push(section);
}
const columnGap = 500;
const rowGap = 350;
const nodeWidth = 120;
const nodeHeight = 60;
const padding = 40;
const maxDepth = Math.max(...Object.values(depths));
const maxRows = Math.max(
    ...Object.values(columns).map(column => column.length)
);

const width = (maxDepth + 1) * columnGap + padding;
const height = maxRows * rowGap + padding * 2;
container.replaceChildren();
container.style.position = "relative";
container.style.width = `${width}px`;
container.style.height = `${height}px`;
container.style.minWidth = `${width}px`;

// SVG arrow layer.
const svgNS = "http://www.w3.org/2000/svg";
const svg = document.createElementNS(svgNS, "svg");
container.appendChild(svg);

// Create nodes.
for (const [depth, columnSections] of Object.entries(columns)) {
    columnSections.forEach((section, index) => {
        const x = Number(depth) * columnGap + 20;
        const y = index * rowGap + padding;
        nodes[section] = {
            x,
            y,
            right: x + nodeWidth,
            centerY: y + nodeHeight / 2
        };
        const node = document.createElement("a");
        node.className = "treeNode";
        node.href = `/Paths/sect${section}.htm`;
        node.textContent = section;
        Object.assign(node.style, {
            left: `${x}px`,
            top: `${y}px`,
            width: `${nodeWidth}px`,
            height: `${nodeHeight}px`,
            zIndex: "1"
        });
        container.appendChild(node);
    });
}

// Draw connectors.
for (const [parent, child] of edges) {
    const a = nodes[parent];
    const b = nodes[child];
    if (!a || !b) continue;
    const line = document.createElementNS(svgNS, "path");
    const middleX = (a.right + b.x) / 2;
    line.setAttribute(
        "d",
        `M ${a.right} ${a.centerY}
         C ${middleX} ${a.centerY},
           ${middleX} ${b.centerY},
           ${b.x} ${b.centerY}`
    );
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "#b3adb3");
    line.setAttribute("stroke-width", "4");
    svg.appendChild(line);
}