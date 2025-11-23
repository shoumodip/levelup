"use strict";
const DAY = 8.64e7;
function todayTime() {
    const time = new Date();
    time.setHours(0);
    time.setMinutes(0);
    time.setSeconds(0);
    time.setMilliseconds(0);
    return time.getTime();
}
function numberToRomanString(num) {
    const table = {
        M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1
    };
    let roman = "";
    for (const key in table) {
        while (num >= table[key]) {
            roman += key;
            num -= table[key];
        }
    }
    return roman;
}
function pointsNeeded(level, scalar) {
    if (level <= 2) {
        return level * scalar;
    }
    return (level - 2) * 5 * scalar;
}
function setClass(element, ...names) {
    element.classList.add(...names);
    return element;
}
function setClick(element, callback) {
    element.onclick = callback;
    return element;
}
function setColor(element, color) {
    element.style.color = color;
    return element;
}
function setBorder(element, color) {
    element.style.borderColor = color;
    return element;
}
function setFontSize(element, size) {
    element.style.fontSize = size;
    return element;
}
function setDimensions(element, width, height) {
    element.style.width = width;
    element.style.height = height;
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
function newInput(title, value) {
    const input = document.createElement("input");
    input.placeholder = title;
    input.value = value;
    return input;
}
function newHeader(title, level, asHtml) {
    const header = document.createElement("h" + level);
    if (asHtml) {
        header.innerHTML = title;
    }
    else {
        header.innerText = title;
    }
    return header;
}
function newButton(title, click) {
    const button = document.createElement("button");
    if (typeof title === "string") {
        button.innerText = title;
    }
    else {
        button.appendChild(title);
        setClass(button, "fixed");
    }
    button.onclick = click;
    return button;
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
function newHeaderPanel(...children) {
    const div = setClass(document.createElement("div"), "header");
    div.replaceChildren(...children.filter((e) => e !== null));
    return div;
}
function newFooterPanel(...children) {
    const div = setClass(document.createElement("div"), "footer");
    div.replaceChildren(...children.filter((e) => e !== null));
    return div;
}
const AttribColors = {
    STR: "#FF5A5F",
    VIT: "#2ECC71",
    INT: "#3498DB",
    AGI: "#F1C40F",
    SKL: "#A55EEA",
    Level: "#FFFFFF"
};
const NavigatorColors = {
    Notes: "#F4A259",
    Tasks: "#3FA9F5",
    Quests: "#A067FF",
    Rewards: "#31D27A"
};
let sounds;
let symbols;
let level;
let money;
let notes = [];
let tasks = [];
let quests = [];
let attribs = [];
let rewards = [];
function saveState() {
    localStorage["levelup#level"] = JSON.stringify(level);
    localStorage["levelup#money"] = JSON.stringify(money);
    localStorage["levelup#tasks"] = JSON.stringify(tasks);
    localStorage["levelup#quests"] = JSON.stringify(quests);
    localStorage["levelup#attribs"] = JSON.stringify(attribs);
    localStorage["levelup#rewards"] = JSON.stringify(rewards);
    localStorage["levelup#notes"] = JSON.stringify(notes);
}
function addPointsOverall(attrib, points, popup) {
    money += points;
    function addPointsToAttrib(attrib, points, popup) {
        attrib.points += points;
        if (attrib.points >= attrib.needed) {
            const originalLevel = attrib.level;
            while (attrib.points >= attrib.needed) {
                attrib.level++;
                attrib.points -= attrib.needed;
                attrib.needed = pointsNeeded(attrib.level, attrib.scalar);
            }
            popup.visible = true;
            if (!popup.title) {
                popup.title = "Level Up!";
            }
            popup.lines.push({
                text: `${attrib.title} ${numberToRomanString(originalLevel)} &#10230; ${numberToRomanString(attrib.level)}`,
                color: AttribColors[attrib.title]
            });
        }
    }
    addPointsToAttrib(level, points, popup);
    addPointsToAttrib(attrib, points, popup);
    saveState();
}
function drawPopup(popup, back) {
    if (!popup.visible) {
        return back();
    }
    let popupNode;
    let overlayNode;
    popupNode = setClass(document.createElement("div"), "overlay", "show");
    overlayNode = setClass(newVertical(setColor(newHeader(popup.title, 1), "#D9C77E"), setClass(newVertical(...popup.lines.map((line, index) => {
        const element = setColor(newHeader(line.text, 2, true), line.color);
        if (popup.isQuest && index === 0) {
            setClass(element, "quest-title");
        }
        return element;
    })), "center", "padding"), setClass(newHorizontal(setClass(newButton("Continue", () => {
        let oneDone = false;
        popupNode.addEventListener("animationend", () => {
            popupNode.remove();
            if (oneDone) {
                back();
            }
            else {
                oneDone = true;
            }
        }, { once: true });
        overlayNode.addEventListener("animationend", () => {
            overlayNode.remove();
            if (oneDone) {
                back();
            }
            else {
                oneDone = true;
            }
        }, { once: true });
        popupNode.classList.remove("show");
        overlayNode.classList.remove("show");
        setClass(popupNode, "hide");
        setClass(overlayNode, "hide");
    }))))), "boxed", "popup", "center", "show");
    document.body.append(overlayNode, popupNode);
}
function drawSelector(selector) {
    let panel = newHorizontal();
    for (let i = 0; i < selector.items.length; i++) {
        const item = selector.items[i];
        let label;
        if (selector.prefixCoin) {
            const fontSize = "1.4rem";
            label = newHorizontal(setDimensions(symbols.coin, fontSize, fontSize), setColor(setFontSize(newHeader(item.title, 2), fontSize), item.color));
        }
        else {
            label = setColor(newHeader(item.title, 1), item.color);
        }
        const button = setClick(setClass(label, "boxed", "center", "navigator"), () => {
            selector.index = i;
            for (const it of panel.children) {
                const child = it;
                setBorder(child, child.innerText === item.title ? item.color : "");
            }
        });
        if (i === selector.index) {
            button.style.borderColor = item.color;
        }
        panel.appendChild(button);
    }
    return panel;
}
function drawProgressBar(value, total, color) {
    const parent = setClass(document.createElement("div"), "progress-parent");
    const filled = setClass(document.createElement("div"), "progress-filled");
    filled.style.width = `${total === 0 ? 0 : value / total * 100}%`;
    filled.style.backgroundColor = color;
    parent.appendChild(filled);
    return parent;
}
function drawAttrib(attrib) {
    const color = AttribColors[attrib.title];
    return newVertical(newHorizontal(setColor(setClass(newHeader(`${attrib.title} ${numberToRomanString(attrib.level)}`, 1), "stretch"), color), newHeader(`${attrib.points}/${attrib.needed}`, 2)), drawProgressBar(attrib.points, attrib.needed, color));
}
function drawMoney() {
    return setClass(newFooterPanel(setClass(newHorizontal(symbols.coin, newHeader(String(money), 1)), "center")), "stretch");
}
function drawTask(task, index) {
    return setClass(newHorizontal(setClick(setClass(newVertical(newHeader(task.title, 1), setColor(newHeader(attribs[task.attrib].title, 2), AttribColors[attribs[task.attrib].title])), "flex-one"), () => drawTaskEditPage(index)), domMaybe(setClass(newButton(symbols.done, () => {
        task.lastDone = todayTime();
        const popup = { visible: false, title: "", lines: [] };
        addPointsOverall(attribs[task.attrib], 1, popup);
        if (popup.visible) {
            sounds.levelup.play();
        }
        else {
            sounds.taskCompleted.play();
        }
        drawPopup(popup, drawTasksPage);
    }), "right", "vcenter-margined"), todayTime() !== task.lastDone)), "boxed");
}
function drawTaskEditPage(index) {
    const task = index === undefined ? undefined : tasks[index];
    const input = newInput("Task Title", task ? task.title : "");
    const attribSelector = {
        items: attribs.map(it => { return { title: it.title, color: AttribColors[it.title] }; }),
        index: task ? task.attrib : 0
    };
    document.body.replaceChildren(newPaddedPage(newHorizontal(newButton(symbols.back, drawTasksPage), setClass(input, "stretch"), newButton(symbols.done, () => {
        if (input.value === "") {
            return;
        }
        if (task) {
            task.title = input.value;
            task.attrib = attribSelector.index;
        }
        else {
            tasks.push({ title: input.value, attrib: attribSelector.index, lastDone: todayTime() - DAY });
        }
        saveState();
        drawTasksPage();
    }), domMaybe(newButton(symbols.delete, () => {
        tasks.splice(index, 1);
        saveState();
        drawTasksPage();
    }), task !== undefined)), drawSelector(attribSelector)));
}
function drawTasksPage() {
    document.body.replaceChildren(newHeaderPanel(newButton(symbols.back, drawMainPage), newHeader("Tasks", 1), setClass(newButton(symbols.add, () => drawTaskEditPage()), "right")), newPaddedPage(...tasks.map(drawTask)), drawMoney());
}
function drawQuest(quest, index) {
    let node;
    node = setClass(newHorizontal(setClick(setClass(newVertical(newHeader(quest.title, 1), setColor(newHeader(`${attribs[quest.attrib].title} +${quest.points}`, 2), AttribColors[attribs[quest.attrib].title])), "flex-one"), () => drawQuestEditPage(index)), setClass(newButton(symbols.done, () => {
        const popup = {
            visible: true,
            title: "Quest Completed!",
            lines: [{ text: quest.title, color: NavigatorColors.Quests }],
            isQuest: true,
        };
        quests.splice(index, 1);
        node.remove();
        sounds.questCompleted.play();
        addPointsOverall(attribs[quest.attrib], quest.points, popup);
        drawPopup(popup, drawQuestsPage);
    }), "right", "vcenter-margined")), "boxed");
    return node;
}
function drawQuestEditPage(index) {
    const quest = index === undefined ? undefined : quests[index];
    const input = newInput("Quest Title", quest ? quest.title : "");
    const attribSelector = {
        items: attribs.map(it => { return { title: it.title, color: AttribColors[it.title] }; }),
        index: quest ? quest.attrib : 0
    };
    const pointSelector = {
        items: [10, 20, 30, 40, 50, 60, 70, 80].map(it => { return { title: String(it), color: AttribColors.Level }; }),
        index: quest ? quest.points / 10 - 1 : 0
    };
    document.body.replaceChildren(newPaddedPage(newHorizontal(newButton(symbols.back, drawQuestsPage), setClass(input, "stretch"), newButton(symbols.done, () => {
        if (input.value === "") {
            return;
        }
        const points = parseInt(pointSelector.items[pointSelector.index].title);
        if (quest) {
            quest.title = input.value;
            quest.attrib = attribSelector.index;
            quest.points = points;
        }
        else {
            quests.push({
                title: input.value,
                attrib: attribSelector.index,
                points: points
            });
        }
        saveState();
        drawQuestsPage();
    }), domMaybe(newButton(symbols.delete, () => {
        quests.splice(index, 1);
        saveState();
        drawQuestsPage();
    }), quest !== undefined)), drawSelector(attribSelector), drawSelector(pointSelector)));
}
function drawQuestsPage() {
    document.body.replaceChildren(newHeaderPanel(newButton(symbols.back, drawMainPage), newHeader("Quests", 1), setClass(newButton(symbols.add, () => drawQuestEditPage()), "right")), newPaddedPage(...quests.map(drawQuest)), drawMoney());
}
function moneyColor(money) {
    if (money == 3) {
        return "#CD7F32"; // Bronze
    }
    if (money == 6) {
        return "#CFCFCF"; // Silver
    }
    if (money == 12) {
        return "#FFD93D"; // Gold
    }
    return "#7EE7F5"; // Diamond
}
function drawReward(reward, index) {
    return setClass(newHorizontal(setClick(setClass(newVertical(newHeader(reward.title, 1), newHorizontal(setDimensions(symbols.coin, "1.1rem", "1.1rem"), setColor(newHeader(String(reward.cost), 2), moneyColor(reward.cost)))), "flex-one"), () => drawRewardEditPage(index)), domMaybe(setClass(newButton(symbols.done, () => {
        money -= reward.cost;
        sounds.buyReward.play();
        saveState();
        drawRewardsPage();
    }), "right", "vcenter-margined"), money >= reward.cost)), "boxed");
}
function drawRewardEditPage(index) {
    const reward = index === undefined ? undefined : rewards[index];
    const input = newInput("Reward Title", reward ? reward.title : "");
    const costSelector = {
        items: [3, 6, 12, 24].map(it => { return { title: String(it), color: moneyColor(it) }; }),
        index: reward ? Math.log2(reward.cost / 3) : 0,
        prefixCoin: true
    };
    document.body.replaceChildren(newPaddedPage(newHorizontal(newButton(symbols.back, drawRewardsPage), setClass(input, "stretch"), newButton(symbols.done, () => {
        if (input.value === "") {
            return;
        }
        const cost = parseInt(costSelector.items[costSelector.index].title);
        if (reward) {
            reward.title = input.value;
            reward.cost = cost;
        }
        else {
            rewards.push({
                title: input.value,
                cost: cost
            });
        }
        saveState();
        drawRewardsPage();
    }), domMaybe(newButton(symbols.delete, () => {
        rewards.splice(index, 1);
        saveState();
        drawRewardsPage();
    }), reward !== undefined)), drawSelector(costSelector)));
}
function drawRewardsPage() {
    document.body.replaceChildren(newHeaderPanel(newButton(symbols.back, drawMainPage), newHeader("Rewards", 1), setClass(newButton(symbols.add, () => drawRewardEditPage()), "right")), newPaddedPage(...rewards.map(drawReward)), drawMoney());
}
function drawNote(index) {
    return setClass(newHorizontal(setClick(setClass(setFontSize(newHeader(notes[index], 1), "1.1rem"), "flex-one", "vcenter-margined"), () => drawNoteEditPage(index)), setClass(newButton(symbols.delete, () => {
        notes.splice(index, 1);
        saveState();
        drawNotesPage();
    }), "right", "vcenter-margined")), "boxed");
}
function drawNoteEditPage(index) {
    const input = newInput("Note", index === undefined ? "" : notes[index]);
    document.body.replaceChildren(newPaddedPage(newHorizontal(newButton(symbols.back, drawNotesPage), setClass(input, "stretch"), newButton(symbols.done, () => {
        if (input.value === "") {
            return;
        }
        if (index === undefined) {
            notes.push(input.value);
        }
        else {
            notes[index] = input.value;
        }
        saveState();
        drawNotesPage();
    }))));
}
function drawNotesPage() {
    document.body.replaceChildren(newHeaderPanel(newButton(symbols.back, drawMainPage), newHeader("Notes", 1), setClass(newButton(symbols.add, () => drawNoteEditPage()), "right")), newPaddedPage(...notes.map((_, index) => drawNote(index))));
}
function drawMainPage() {
    function navigator(title, click) {
        const color = NavigatorColors[title];
        return setBorder(setColor(setClick(setClass(setFontSize(newHeader(title, 1), "1.1rem"), "boxed", "center", "navigator"), click), color), color);
    }
    document.body.replaceChildren(newPaddedPage(setClass(drawAttrib(level), "boxed"), setClass(newVertical(...attribs.map(drawAttrib)), "boxed"), setClass(newVertical(newHorizontal(setDimensions(symbols.coin, "1.4rem", "1.4rem"), setClass(newHeader(String(money), 2), "right"))), "boxed"), newHorizontal(navigator("Notes", drawNotesPage), navigator("Tasks", drawTasksPage), navigator("Quests", drawQuestsPage), navigator("Rewards", drawRewardsPage))));
}
window.onload = () => {
    sounds = {
        levelup: document.getElementById("sound-levelup"),
        buyReward: document.getElementById("sound-buy-reward"),
        taskCompleted: document.getElementById("sound-task-completed"),
        questCompleted: document.getElementById("sound-quest-completed")
    };
    symbols = new Proxy({
        add: document.getElementById("svg-icon-add"),
        back: document.getElementById("svg-icon-back"),
        coin: document.getElementById("svg-icon-coin"),
        done: document.getElementById("svg-icon-done"),
        delete: document.getElementById("svg-icon-delete"),
    }, {
        get(target, key) {
            const value = target[key];
            if (value instanceof Node) {
                return value.cloneNode(true);
            }
            return value;
        }
    });
    let needToSave = false;
    const moneySave = localStorage["levelup#money"];
    if (moneySave) {
        money = JSON.parse(moneySave);
    }
    else {
        money = 0;
        needToSave = true;
    }
    const levelSave = localStorage["levelup#level"];
    if (levelSave) {
        level = JSON.parse(levelSave);
    }
    else {
        needToSave = true;
        level = { title: "Level", level: 1, points: 0, needed: 5, scalar: 5 };
    }
    const notesSave = localStorage["levelup#notes"];
    if (notesSave) {
        notes = JSON.parse(notesSave);
    }
    else {
        needToSave = true;
    }
    const tasksSave = localStorage["levelup#tasks"];
    if (tasksSave) {
        tasks = JSON.parse(tasksSave);
    }
    else {
        needToSave = true;
    }
    const questsSave = localStorage["levelup#quests"];
    if (questsSave) {
        quests = JSON.parse(questsSave);
    }
    else {
        needToSave = true;
    }
    const attribsSave = localStorage["levelup#attribs"];
    if (attribsSave) {
        attribs = JSON.parse(attribsSave);
    }
    else {
        needToSave = true;
        attribs.push({ title: "STR", level: 1, points: 0, needed: 1, scalar: 1 });
        attribs.push({ title: "VIT", level: 1, points: 0, needed: 1, scalar: 1 });
        attribs.push({ title: "INT", level: 1, points: 0, needed: 1, scalar: 1 });
        attribs.push({ title: "AGI", level: 1, points: 0, needed: 1, scalar: 1 });
        attribs.push({ title: "SKL", level: 1, points: 0, needed: 1, scalar: 1 });
    }
    const rewardsSave = localStorage["levelup#rewards"];
    if (rewardsSave) {
        rewards = JSON.parse(rewardsSave);
    }
    else {
        needToSave = true;
    }
    if (needToSave) {
        saveState();
    }
    drawMainPage();
};
