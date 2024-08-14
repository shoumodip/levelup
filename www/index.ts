// Time
const DAY = 8.64e7

function todayTime() {
    const time = new Date()
    time.setHours(0)
    time.setMinutes(0)
    time.setSeconds(0)
    time.setMilliseconds(0)
    return time.getTime()
}

// HTML
function setClick<T extends HTMLElement>(element: T, callback: (this: GlobalEventHandlers, ev: MouseEvent) => any): T {
    element.onclick = callback
    return element
}

function setClass<T extends HTMLElement>(element: T, ...names: string[]): T {
    element.classList.add(...names)
    return element
}

function domMaybe<T extends HTMLElement>(element: T, cond: boolean): (T | undefined) {
    if (cond) {
        return element
    } else {
        return undefined
    }
}

function newInput(title: string, type?: string): HTMLInputElement {
    const input = document.createElement("input")
    input.placeholder = title

    if (type !== undefined) {
        input.type = type
    }

    return input
}

function newButton(title: string, click: (this: GlobalEventHandlers, ev: MouseEvent) => any, compress?: boolean): HTMLButtonElement {
    const button = document.createElement("button")
    button.innerText = title
    button.onclick = click

    if (!compress) {
        return setClass(button, "stretch")
    }
    return button
}

function newHeader(text: string, level: number): HTMLHeadingElement {
    const h1 = document.createElement("h" + level) as HTMLHeadingElement
    h1.innerText = text
    return h1
}

function newSelect(...options: string[]): HTMLSelectElement {
    const select = document.createElement("select")

    for (let i = 0; i < options.length; i++) {
        const element = document.createElement("option")
        element.value = i.toString()
        element.innerText = options[i]
        select.appendChild(element)
    }

    return select
}

function newVertical(...children: (HTMLElement | undefined)[]): HTMLDivElement {
    const div = setClass(document.createElement("div"), "vertical")
    div.replaceChildren(...children.filter((e) => e !== undefined))
    return div
}

function newHorizontal(...children: (HTMLElement | undefined)[]): HTMLDivElement {
    const div = setClass(document.createElement("div"), "horizontal")
    div.replaceChildren(...children.filter((e) => e !== undefined))
    return div
}

function newPaddedPage(...children: (HTMLElement | undefined)[]): HTMLDivElement {
    return setClass(newVertical(...children), "padding")
}

// Main
class Stat {
    title: string
    value: number

    constructor(title: string, value: number) {
        this.title = title
        this.value = value
    }
}

class Task {
    title: string
    stat: number
    last: number

    constructor(title: string, stat: number, last: number) {
        this.title = title
        this.stat = stat
        this.last = last
    }
}

class Reward {
    title: string
    cost: number

    constructor(title: string, cost: number) {
        this.title = title
        this.cost = cost
    }
}

const stats: Stat[] = []
const tasks: Task[] = []
const rewards: Reward[] = []

const profile = {
    level: 1,
    points: 0
}

const tutorial = {
    stats: false,
    tasks: false,
    rewards: false,
    defaults: false,
}

function loadData() {
    {
        const data = localStorage["levelupStats"] as (string | null)
        if (data) {
            const lines = data.split("\n")
            profile.level = parseInt(lines[0])

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i]
                if (line === "") {
                    continue
                }

                const j = line.indexOf(" ")
                stats.push(new Stat(
                    line.slice(j + 1),
                    parseInt(line.slice(0, j))
                ))
            }
        }
    }

    {
        const data = localStorage["levelupTasks"] as (string | null)
        if (data) {
            const lines = data.split("\n")
            for (const line of lines) {
                const i = line.indexOf(" ")
                const j = line.indexOf(" ", i + 1)

                tasks.push(new Task(
                    line.slice(j + 1),
                    parseInt(line.slice(i + 1, j)),
                    parseInt(line.slice(0, i))
                ))
            }
        }
    }

    {
        const data = localStorage["levelupRewards"] as (string | null)
        if (data) {
            const lines = data.split("\n")
            profile.points = parseInt(lines[0])

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i]
                if (line === "") {
                    continue
                }

                const j = line.indexOf(" ")
                rewards.push(new Reward(
                    line.slice(j + 1),
                    parseInt(line.slice(0, j))
                ))
            }
        }
    }

    {
        const data = localStorage["levelupTutorial"] as (string | null)
        if (data) {
            const lines = data.split("\n")
            tutorial.stats = lines[0] === "true"
            tutorial.tasks = lines[1] === "true"
            tutorial.rewards = lines[2] === "true"
            tutorial.defaults = lines[3] === "true"
        }
    }
}

function saveData() {
    localStorage["levelupStats"] = profile.level + "\n" + stats.map((v) => v.value + " " + v.title).join("\n")
    localStorage["levelupTasks"] = tasks.map((v) => v.last + " " + v.stat + " " + v.title).join("\n")
    localStorage["levelupRewards"] = profile.points + "\n" + rewards.map((v) => v.cost + " " + v.title).join("\n")
    localStorage["levelupTutorial"] = tutorial.stats +
        "\n" + tutorial.tasks +
        "\n" + tutorial.rewards +
        "\n" + tutorial.defaults
}

function drawStat(label: string, value: string, index: number) {
    return setClick(
        setClass(
            newHorizontal(
                setClass(newHeader(label, 1), "stretch"),
                newHeader(value, 1),
            ),
            "boxed"
        ),
        () => index !== -1 ? drawStatEditPage(index) : null
    )
}

function drawTask(task: Task, index: number) {
    return setClass(
        newHorizontal(
            setClick(
                setClass(
                    newVertical(
                        newHeader(task.title, 1),
                        newHeader(stats[task.stat].title, 2)
                    ),
                    "stretch"
                ),
                () => drawTaskEditPage(index)
            ),
            domMaybe(
                newButton(
                    "Done", () => {
                        task.last = todayTime()
                        profile.points++
                        stats[task.stat].value++

                        saveData()
                        drawNotifyPage("+1 reward, +1 " + stats[task.stat].title)
                    },
                    true
                ),
                todayTime() !== task.last
            )
        ),
        "boxed"
    )
}

function drawReward(reward: Reward, index: number) {
    return setClass(
        newHorizontal(
            setClick(
                setClass(
                    newVertical(
                        newHeader(reward.title, 1),
                        newHeader(reward.cost.toString(), 2)
                    ),
                    "stretch"
                ),
                () => drawRewardEditPage(index)
            ),
            newButton(
                "Buy", () => {
                    if (profile.points < reward.cost) {
                        drawNotifyPage("Not enough points", drawRewardsPage)
                        return
                    }

                    profile.points -= reward.cost
                    saveData()

                    drawNotifyPage("Reward: " + reward.title + "!", drawRewardsPage)
                },
                true
            )
        ),
        "boxed"
    )
}

function drawStatEditPage(index: number) {
    const title = newInput("Title")

    if (index !== -1) {
        title.value = stats[index].title
    }

    document.body.replaceChildren(
        newPaddedPage(
            newHorizontal(
                newButton("Back", drawStatsPage),
                newButton("Done", () => {
                    if (title.value !== "") {
                        if (index === -1) {
                            stats.push(new Stat(title.value, 0))
                            tutorial.stats = true
                        } else {
                            stats[index].title = title.value
                        }

                        saveData()
                        drawStatsPage()
                    }
                }),
                domMaybe(
                    newButton("Remove", () => {
                        stats.splice(index, 1)

                        let j = 0
                        for (let i = 0; i < tasks.length; i++) {
                            if (tasks[i].stat !== index) {
                                if (tasks[i].stat > index) {
                                    tasks[i].stat--
                                }

                                tasks[j++] = tasks[i]
                            }
                        }
                        tasks.length = j

                        saveData()
                        drawStatsPage()
                    }),
                    index !== -1
                )
            ),
            title
        ),
    )
}

function drawTaskEditPage(index: number) {
    if (stats.length === 0) {
        drawNotifyPage("You have no stats that can be assigned to tasks. Create a stat first", drawStatsPage)
        return
    }

    const title = newInput("Title")
    const type = newSelect(...stats.map((v) => v.title.toUpperCase()))

    if (index !== -1) {
        type.value = tasks[index].stat.toString()
        title.value = tasks[index].title
    }

    document.body.replaceChildren(
        newPaddedPage(
            newHorizontal(
                newButton("Back", drawMainPage),
                newButton("Done", () => {
                    if (title.value !== "") {
                        if (index === -1) {
                            tasks.push(new Task(
                                title.value,
                                parseInt(type.value),
                                todayTime() - DAY
                            ))
                            tutorial.tasks = true
                        } else {
                            tasks[index].stat = parseInt(type.value)
                            tasks[index].title = title.value
                        }

                        saveData()
                        drawMainPage()
                    }
                }),
                domMaybe(
                    newButton("Remove", () => {
                        tasks.splice(index, 1)

                        saveData()
                        drawMainPage()
                    }),
                    index !== -1
                )
            ),
            title,
            type
        ),
    )
}

function drawRewardEditPage(index: number) {
    const title = newInput("Title")
    const cost = newInput("Cost", "number")

    if (index !== -1) {
        cost.value = rewards[index].cost.toString()
        title.value = rewards[index].title
    }

    document.body.replaceChildren(
        newPaddedPage(
            newHorizontal(
                newButton("Back", drawRewardsPage),
                newButton("Done", () => {
                    if (title.value !== "" && cost.value !== "") {
                        if (index === -1) {
                            rewards.push(new Reward(
                                title.value,
                                parseInt(cost.value)
                            ))

                            tutorial.rewards = true
                        } else {
                            rewards[index].cost = parseInt(cost.value)
                            rewards[index].title = title.value
                        }

                        saveData()
                        drawRewardsPage()
                    }
                }),
                domMaybe(
                    newButton("Remove", () => {
                        rewards.splice(index, 1)

                        saveData()
                        drawRewardsPage()
                    }),
                    index !== -1
                )
            ),
            title,
            cost
        ),
    )
}

function drawInfo(body: string[], type: "stats" | "tasks" | "rewards", main: () => void, extra?: HTMLElement): HTMLDivElement {
    return setClass(
        newVertical(
            newHeader("Info", 1),
            ...body.map((i) => newHeader(i, 2)),
            setClass(
                newHorizontal(
                    extra,
                    newButton("Dismiss", () => {
                        tutorial[type] = true
                        saveData()
                        main()
                    }, true)
                ),
                "center"
            )
        ),
        "boxed"
    )
}

function drawMainPage() {
    let levelup = stats.length !== 0
    for (const stat of stats) {
        if (stat.value < 10) {
            levelup = false
            break
        }
    }

    if (levelup) {
        profile.level++
        for (const stat of stats) {
            stat.value -= 10
        }

        saveData()
        drawNotifyPage("Leveled up!")
        return
    }

    document.body.replaceChildren(
        newPaddedPage(
            newHorizontal(
                newButton("Stats", drawStatsPage),
                newButton("Rewards", drawRewardsPage),
                newButton("Add Task", () => drawTaskEditPage(-1))
            ),
            ...(tutorial.tasks ? tasks.map(drawTask) : [
                drawInfo([
                    "Tasks are daily quests you have to complete in order to gain points",
                    "Each task has an associated stat which gains 1 point on completion",
                    "Failure to complete more than 1 task per day will result in a penalty",
                    "Click on the 'Add Task' button to add a task to your daily queue"
                ], "tasks", drawMainPage)
            ])
        )
    )
}

function drawStatsPage() {
    document.body.replaceChildren(
        newPaddedPage(
            newHorizontal(
                newButton("Back", drawMainPage),
                newButton("Add Stat", () => drawStatEditPage(-1))
            ),
            drawStat("Level", profile.level.toString(), -1),
            ...(tutorial.stats ? stats.map((v, i) => drawStat(v.title, v.value + "/10", i)) : [
                drawInfo([
                    "Stats are fields of interest you can improve in",
                    "Each daily task is assigned a specific stat, which adds a stat point upon completion",
                    "When all stats reach 10 or more, you level up",
                    "Click on the 'Add Stat' button to add a stat to your profile"
                ], "stats", drawStatsPage)
            ])
        )
    )
}

function drawRewardsPage() {
    document.body.replaceChildren(
        newPaddedPage(
            newHorizontal(
                newButton("Back", drawMainPage),
                newButton("Add Reward", () => drawRewardEditPage(-1)),
            ),
            drawStat("Points", profile.points.toString(), -1),
            ...(tutorial.rewards ? rewards.map(drawReward) : [
                drawInfo([
                    "Completion of tasks grants reward points, which can be used to buy, well, rewards",
                    "Rewards are any pleasurable activity you wish to partake in, like social media, fast food, etc.",
                    "Note that you personally need to maintain the discipline to not do those activies unless bought",
                    "Click on the 'Add Reward' button to add a reward, and set a point price accordingly"
                ], "rewards", drawRewardsPage)
            ])
        )
    )
}

function notifyOver() {
    document.body.classList.remove("center")
    document.body.classList.remove("sidePadding")
}

function drawNotifyPage(message: string, back: (() => void) = drawMainPage, buttons?: HTMLButtonElement[]) {
    document.body.classList.add("center")
    document.body.classList.add("sidePadding")
    document.body.replaceChildren(
        setClass(
            newVertical(
                newHeader(message, 1),
                (buttons !== undefined ? newHorizontal(...buttons) :
                    newButton("OK", () => {
                        notifyOver()
                        back()
                    })
                ),
            ),
            "boxed",
            "center"
        )
    )
}

window.onload = () => {
    const font = new FontFace("No Continue", "url('fonts/NoContinue.ttf')")
    document.fonts.add(font)

    font.load()
    document.fonts.ready.then(() => {
        loadData()

        const today = todayTime()
        if (tutorial.defaults) {
            let missed = 0

            for (const task of tasks) {
                if (today - task.last > DAY) {
                    missed++
                    task.last = today - DAY
                }
            }

            if (missed !== 0) {
                saveData()
            }

            if (missed > 1) {
                const penalties = [
                    "No phone for 1 day",
                    "100 burpees",
                    "Squat hold for 3 mins",
                    "Plank hold for 3 mins",
                ]

                const penalty = penalties[Math.floor(Math.random() * penalties.length)]
                drawNotifyPage("Penalty: " + penalty)
            } else {
                drawMainPage()
            }
        } else {
            drawNotifyPage("Setup recommended defaults?", drawMainPage, [
                newButton("Yes", () => {
                    tutorial.defaults = true

                    stats.push(new Stat("Strength", 0))
                    stats.push(new Stat("Stamina", 0))
                    stats.push(new Stat("Agility", 0))
                    stats.push(new Stat("Intelligence", 0))
                    stats.push(new Stat("Practicality", 0))

                    tasks.push(new Task("Workout", 0, today - DAY))
                    tasks.push(new Task("Cardio", 1, today - DAY))
                    tasks.push(new Task("Stretch", 2, today - DAY))
                    tasks.push(new Task("Complete a unit", 3, today - DAY))
                    tasks.push(new Task("Practise a skill", 4, today - DAY))

                    rewards.push(new Reward("30 mins of content", 1))
                    rewards.push(new Reward("A cheat meal", 1))

                    saveData()
                    notifyOver()
                    drawMainPage()
                }),

                newButton("No", () => {
                    tutorial.defaults = true

                    saveData()
                    notifyOver()
                    drawMainPage()
                })
            ])
        }
    })
}
