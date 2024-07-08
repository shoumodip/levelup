"use strict";
// Time
const DAY = 8.64e7;
function todayTime() {
    const time = new Date();
    time.setHours(0);
    time.setMinutes(0);
    time.setSeconds(0);
    time.setMilliseconds(0);
    return time.getTime();
}
// HTML
function setClick(element, callback) {
    element.onclick = callback;
    return element;
}
function setClass(element, ...names) {
    element.classList.add(...names);
    return element;
}
function domMaybe(element, cond) {
    if (cond) {
        return element;
    }
    else {
        return null;
    }
}
function newInput(title, type) {
    const input = document.createElement("input");
    input.placeholder = title;
    if (type !== undefined) {
        input.type = type;
    }
    return input;
}
function newButton(title, click, compress) {
    const button = document.createElement("button");
    button.innerText = title;
    button.onclick = click;
    if (!compress) {
        return setClass(button, "stretch");
    }
    return button;
}
function newHeader(text, level) {
    const h1 = document.createElement("h" + level);
    h1.innerText = text;
    return h1;
}
function newSelect(...options) {
    const select = document.createElement("select");
    for (let i = 0; i < options.length; i++) {
        const element = document.createElement("option");
        element.value = i.toString();
        element.innerText = options[i];
        select.appendChild(element);
    }
    return select;
}
function newVertical(...children) {
    const div = setClass(document.createElement("div"), "vertical");
    div.replaceChildren(...children.filter((e) => e !== null));
    return div;
}
function newHorizontal(...children) {
    const div = setClass(document.createElement("div"), "horizontal");
    div.replaceChildren(...children.filter((e) => e !== null));
    return div;
}
function newPaddedPage(...children) {
    return setClass(newVertical(...children), "padding");
}
// Main
class Stat {
    constructor(title, value) {
        this.title = title;
        this.value = value;
    }
}
class Task {
    constructor(title, stat, last) {
        this.title = title;
        this.stat = stat;
        this.last = last;
    }
}
class Reward {
    constructor(title, cost) {
        this.title = title;
        this.cost = cost;
    }
}
const tasks = [];
const rewards = [];
const profile = {
    level: 1,
    points: 0,
    stats: [
        new Stat("Strength", 0),
        new Stat("Vitality", 0),
        new Stat("Intelligence", 0),
        new Stat("Practicality", 0)
    ]
};
function loadData() {
    {
        const data = localStorage["levelupTasks"];
        if (data) {
            const lines = data.split("\n");
            for (const line of lines) {
                const i = line.indexOf(" ");
                const j = line.indexOf(" ", i + 1);
                tasks.push(new Task(line.slice(j + 1), parseInt(line.slice(i + 1, j)), parseInt(line.slice(0, i))));
            }
        }
    }
    {
        const data = localStorage["levelupProfile"];
        if (data) {
            const lines = data.split("\n");
            profile.level = parseInt(lines[0]);
            profile.points = parseInt(lines[1]);
            if (lines.length > 2) {
                profile.stats.length = 0;
            }
            for (let i = 2; i < lines.length; i++) {
                const line = lines[i];
                const j = line.indexOf(" ");
                profile.stats.push(new Stat(line.slice(j + 1), parseInt(line.slice(0, j))));
            }
        }
    }
    {
        const data = localStorage["levelupRewards"];
        if (data) {
            const lines = data.split("\n");
            for (const line of lines) {
                const i = line.indexOf(" ");
                rewards.push(new Reward(line.slice(i + 1), parseInt(line.slice(0, i))));
            }
        }
    }
}
function saveData() {
    localStorage["levelupTasks"] = tasks.map((v) => v.last + " " + v.stat + " " + v.title).join("\n");
    localStorage["levelupProfile"] = profile.level
        + "\n" + profile.points
        + "\n" + profile.stats.map((v) => v.value + " " + v.title).join("\n");
    localStorage["levelupRewards"] = rewards.map((v) => v.cost + " " + v.title).join("\n");
}
function drawStat(label, value, index) {
    return setClick(setClass(newHorizontal(setClass(newHeader(label, 1), "stretch"), newHeader(value, 1)), "boxed"), () => index !== -1 ? drawStatEditPage(index) : null);
}
function drawTask(task, index) {
    return setClass(newHorizontal(setClick(setClass(newVertical(newHeader(task.title, 1), newHeader(profile.stats[task.stat].title, 2)), "stretch"), () => drawTaskEditPage(index)), domMaybe(newButton("Done", () => {
        task.last = todayTime();
        profile.points++;
        profile.stats[task.stat].value++;
        saveData();
        drawMainPage();
    }, true), todayTime() !== task.last)), "boxed");
}
function drawReward(reward, index) {
    return setClass(newHorizontal(setClick(setClass(newVertical(newHeader(reward.title, 1), newHeader(reward.cost.toString(), 2)), "stretch"), () => drawRewardEditPage(index)), newButton("Buy", () => {
        if (profile.points < reward.cost) {
            drawNotifyPage("Not enough points", drawRewardsPage);
            return;
        }
        profile.points -= reward.cost;
        saveData();
        drawNotifyPage("Reward: " + reward.title + "!", drawRewardsPage);
    }, true)), "boxed");
}
function drawStatEditPage(index) {
    const title = newInput("Title");
    if (index !== -1) {
        title.value = profile.stats[index].title;
    }
    document.body.replaceChildren(newPaddedPage(newHorizontal(newButton("Back", drawStatsPage), newButton("Done", () => {
        if (title.value !== "") {
            if (index === -1) {
                profile.stats.push(new Stat(title.value, 0));
            }
            else {
                profile.stats[index].title = title.value;
            }
            saveData();
            drawStatsPage();
        }
    }), domMaybe(newButton("Remove", () => {
        profile.stats.splice(index, 1);
        let j = 0;
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].stat !== index) {
                tasks[j++] = tasks[i];
            }
        }
        tasks.length = j;
        saveData();
        drawStatsPage();
    }), index !== -1)), title));
}
function drawTaskEditPage(index) {
    const title = newInput("Title");
    const type = newSelect(...profile.stats.map((v) => v.title.toUpperCase()));
    if (index !== -1) {
        type.value = tasks[index].stat.toString();
        title.value = tasks[index].title;
    }
    document.body.replaceChildren(newPaddedPage(newHorizontal(newButton("Back", drawMainPage), newButton("Done", () => {
        if (title.value !== "") {
            if (index === -1) {
                tasks.push(new Task(title.value, parseInt(type.value), todayTime() - DAY));
            }
            else {
                tasks[index].stat = parseInt(type.value);
                tasks[index].title = title.value;
            }
            saveData();
            drawMainPage();
        }
    }), domMaybe(newButton("Remove", () => {
        tasks.splice(index, 1);
        saveData();
        drawMainPage();
    }), index !== -1)), title, type));
}
function drawRewardEditPage(index) {
    const title = newInput("Title");
    const cost = newInput("Cost", "number");
    if (index !== -1) {
        cost.value = rewards[index].cost.toString();
        title.value = rewards[index].title;
    }
    document.body.replaceChildren(newPaddedPage(newHorizontal(newButton("Back", drawRewardsPage), newButton("Done", () => {
        if (title.value !== "" && cost.value !== "") {
            if (index === -1) {
                rewards.push(new Reward(title.value, parseInt(cost.value)));
            }
            else {
                rewards[index].cost = parseInt(cost.value);
                rewards[index].title = title.value;
            }
            saveData();
            drawRewardsPage();
        }
    }), domMaybe(newButton("Remove", () => {
        rewards.splice(index, 1);
        saveData();
        drawRewardsPage();
    }), index !== -1)), title, cost));
}
function drawMainPage() {
    let levelup = true;
    for (const stat of profile.stats) {
        if (stat.value < 10) {
            levelup = false;
            break;
        }
    }
    if (levelup) {
        profile.level++;
        for (const stat of profile.stats) {
            stat.value -= 10;
        }
        saveData();
        drawNotifyPage("Leveled up!");
        return;
    }
    document.body.replaceChildren(newPaddedPage(newHorizontal(newButton("Stats", drawStatsPage), newButton("Rewards", drawRewardsPage), newButton("Add Task", () => drawTaskEditPage(-1))), ...tasks.map(drawTask)));
}
function drawStatsPage() {
    document.body.replaceChildren(newPaddedPage(newHorizontal(newButton("Back", drawMainPage), newButton("Add Stat", () => drawStatEditPage(-1))), drawStat("Level", profile.level.toString(), -1), ...profile.stats.map((v, i) => drawStat(v.title, v.value + "/10", i))));
}
function drawRewardsPage() {
    document.body.replaceChildren(newPaddedPage(newHorizontal(newButton("Back", drawMainPage), newButton("Add Reward", () => drawRewardEditPage(-1))), drawStat("Points", profile.points.toString(), -1), ...rewards.map(drawReward)));
}
function drawNotifyPage(message, back = drawMainPage) {
    document.body.classList.add("center");
    document.body.replaceChildren(setClass(newVertical(newHeader(message, 1), newButton("OK", () => {
        document.body.classList.remove("center");
        back();
    })), "boxed", "center"));
}
window.onload = () => {
    const font = new FontFace("No Continue", "url('fonts/NoContinue.ttf')");
    document.fonts.add(font);
    font.load();
    document.fonts.ready.then(() => {
        loadData();
        let missed = 0;
        const today = todayTime();
        for (const task of tasks) {
            if (today - task.last > DAY) {
                missed++;
                task.last = today - DAY;
            }
        }
        if (missed !== 0) {
            saveData();
        }
        if (missed > 1) {
            drawNotifyPage("Penalty: No phone for 1 day");
        }
        else {
            drawMainPage();
        }
    });
};
