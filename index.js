// Time
const DAY = 8.64e7

function Today() {
    const time = new Date()
    time.setHours(0)
    time.setMinutes(0)
    time.setSeconds(0)
    time.setMilliseconds(0)
    return time.getTime()
}

// HTML
function Click(element, callback) {
    element.onclick = callback
    return element
}

function Class(element, ...names) {
    element.classList.add(...names)
    return element
}

function Maybe(element, cond) {
    if (cond) {
        return element
    } else {
        return null
    }
}

function Input(title, type) {
    const input = document.createElement("input")
    input.placeholder = title

    if (type !== null) {
        input.type = type
    }

    return input
}

function Button(title, click, compress) {
    const button = document.createElement("button")
    button.innerText = title
    button.onclick = click

    if (!compress) {
        return Class(button, "stretch")
    }
    return button
}

function Header(text, level) {
    const h1 = document.createElement("h" + level)
    h1.innerText = text
    return h1
}

function Select(...options) {
    const select = document.createElement("select")

    for (const option of options) {
        const element = document.createElement("option")
        element.value = option
        element.innerText = option
        select.appendChild(element)
    }

    return select
}

function Vertical(...children) {
    const div = Class(document.createElement("div"), "vertical")
    div.replaceChildren(...children.filter((e) => e !== null))
    return div
}

function Horizontal(...children) {
    const div = Class(document.createElement("div"), "horizontal")
    div.replaceChildren(...children.filter((e) => e !== null))
    return div
}

function PaddedPage(...children) {
    return Class(Vertical(...children), "padding")
}

// Main
const tasks = []

const profile = {
    STR: 0,
    VIT: 0,
    INT: 0,
    PRC: 0,
    level: 1,
    points: 0
}

const rewards = []

function Load() {
    {
        const data = localStorage["tasks"]
        if (data) {
            const lines = data.split("\n")
            for (const line of lines) {
                const i = line.indexOf(" ")
                const j = line.indexOf(" ", i + 1)

                tasks.push({
                    last: parseInt(line.slice(0, i)),
                    type: line.slice(i + 1, j),
                    title: line.slice(j + 1)
                })
            }
        }
    }

    {
        const data = localStorage["profile"]
        if (data) {
            const lines = data.split(" ")
            profile.STR = parseInt(lines[0])
            profile.VIT = parseInt(lines[1])
            profile.INT = parseInt(lines[2])
            profile.PRC = parseInt(lines[3])
            profile.level = parseInt(lines[4])
            profile.points = parseInt(lines[5])
        }
    }

    {
        const data = localStorage["rewards"]
        if (data) {
            const lines = data.split("\n")
            for (const line of lines) {
                const i = line.indexOf(" ")
                rewards.push({
                    cost: parseInt(line.slice(0, i)),
                    title: line.slice(i + 1)
                })
            }
        }
    }
}

function Save() {
    localStorage["tasks"] = tasks.map((v) => v.last + " " + v.type + " " + v.title).join("\n")

    localStorage["profile"] = profile.STR
        + " " + profile.VIT
        + " " + profile.INT
        + " " + profile.PRC
        + " " + profile.level
        + " " + profile.points

    localStorage["rewards"] = rewards.map((v) => v.cost + " " + v.title).join("\n")
}

function Stat(label, value) {
    return Class(
        Horizontal(
            Class(Header(label, 1), "stretch"),
            Header(value, 1),
        ),
        "boxed"
    )
}

function Task(task, index) {
    return Class(
        Horizontal(
            Click(
                Class(
                    Vertical(
                        Header(task.title, 1),
                        Header(task.type, 2)
                    ),
                    "stretch"
                ),
                () => TaskEditPage(index)
            ),
            Maybe(
                Button(
                    "Done", () => {
                        task.last = Today()
                        profile.points++
                        profile[task.type]++

                        Save()
                        MainPage()
                    },
                    true
                ),
                Today() !== task.last
            )
        ),
        "boxed"
    )
}

function Reward(reward, index) {
    return Class(
        Horizontal(
            Click(
                Class(
                    Vertical(
                        Header(reward.title, 1),
                        Header(reward.cost, 2)
                    ),
                    "stretch"
                ),
                () => RewardEditPage(index)
            ),
            Button(
                "Buy", () => {
                    if (profile.points < reward.cost) {
                        NotifyPage("Not enough points", RewardsPage)
                        return
                    }

                    profile.points -= reward.cost
                    Save()

                    NotifyPage("Reward: " + reward.title + "!", RewardsPage)
                },
                true
            )
        ),
        "boxed"
    )
}

function TaskEditPage(index) {
    const title = Input("Title")
    const type = Select("STR", "VIT", "INT", "PRC")

    if (index !== -1) {
        type.value = tasks[index].type
        title.value = tasks[index].title
    }

    document.body.replaceChildren(
        PaddedPage(
            Horizontal(
                Button("Back", MainPage),
                Button("Done", () => {
                    if (title.value !== "") {
                        if (index === -1) {
                            tasks.push({
                                last: Today() - DAY,
                                type: type.value,
                                title: title.value
                            })
                        } else {
                            tasks[index].type = type.value
                            tasks[index].title = title.value
                        }

                        Save()
                        MainPage()
                    }
                }),
                Maybe(
                    Button("Remove", () => {
                        tasks.splice(index, 1)

                        Save()
                        MainPage()
                    }),
                    index !== -1
                )
            ),
            title,
            type
        ),
    )
}

function RewardEditPage(index) {
    const title = Input("Title")
    const cost = Input("Cost", "number")

    if (index !== -1) {
        cost.value = rewards[index].cost
        title.value = rewards[index].title
    }

    document.body.replaceChildren(
        PaddedPage(
            Horizontal(
                Button("Back", RewardsPage),
                Button("Done", () => {
                    if (title.value !== "" && cost.value !== "") {
                        if (index === -1) {
                            rewards.push({
                                cost: cost.value,
                                title: title.value
                            })
                        } else {
                            rewards[index].cost = cost.value
                            rewards[index].title = title.value
                        }

                        Save()
                        RewardsPage()
                    }
                }),
                Maybe(
                    Button("Remove", () => {
                        rewards.splice(index, 1)

                        Save()
                        RewardsPage()
                    }),
                    index !== -1
                )
            ),
            title,
            cost
        ),
    )
}

function MainPage() {
    if (profile.STR >= 10 && profile.VIT >= 10 && profile.INT >= 10 && profile.PRC >= 10) {
        profile.level++
        profile.STR -= 10
        profile.VIT -= 10
        profile.INT -= 10
        profile.PRC -= 10

        Save()
        NotifyPage("Leveled up!")
        return
    }

    document.body.replaceChildren(
        PaddedPage(
            Horizontal(
                Button("Profile", ProfilePage),
                Button("Rewards", RewardsPage),
                Button("Add Task", () => TaskEditPage(-1))
            ),
            ...tasks.map(Task)
        )
    )
}

function ProfilePage() {
    document.body.replaceChildren(
        PaddedPage(
            Button("Back", MainPage),
            Stat("Level", profile.level),
            Stat("STR", profile.STR + "/10"),
            Stat("VIT", profile.VIT + "/10"),
            Stat("INT", profile.INT + "/10"),
            Stat("PRC", profile.PRC + "/10"),
        )
    )
}

function RewardsPage() {
    document.body.replaceChildren(
        PaddedPage(
            Horizontal(
                Button("Back", MainPage),
                Button("Add Reward", () => RewardEditPage(-1)),
            ),
            Stat("Points", profile.points),
            ...rewards.map(Reward)
        )
    )
}

function NotifyPage(message, back) {
    if (back === null) {
        back = MainPage
    }

    document.body.classList.add("center")
    document.body.replaceChildren(
        Class(
            Vertical(
                Header(message, 1),
                Button("OK", () => {
                    document.body.classList.remove("center")
                    back()
                }),
            ),
            "boxed",
            "center"
        )
    )
}

window.onload = () => {
    Load()

    let missed = 0
    const today = Today()

    for (const task of tasks) {
        if (today - task.last > DAY) {
            missed++
            task.last = today - DAY
        }
    }

    if (missed !== 0) {
        Save()
    }

    if (missed > 1) {
        NotifyPage("Penalty: Do a hard task")
    } else {
        MainPage()
    }
}
