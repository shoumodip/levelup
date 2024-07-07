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

function Input(title) {
    const input = document.createElement("input")
    input.placeholder = title
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

// State
const tasks = []

const profile = {
    STR: 0,
    VIT: 0,
    INT: 0,
    PRC: 0,
    level: 1
}

function Load() {
    {
        const data = localStorage["tasks"]
        if (data) {
            const lines = localStorage["tasks"].split("\n")
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
            const lines = localStorage["profile"].split(" ")
            profile.level = parseInt(lines[0])
            profile.STR = parseInt(lines[1])
            profile.VIT = parseInt(lines[2])
            profile.INT = parseInt(lines[3])
            profile.PRC = parseInt(lines[4])
        }
    }
}

function Save() {
    localStorage["tasks"] = tasks.map((task) => task.last + " " + task.type + " " + task.title).join("\n")
    localStorage["profile"] = profile.level
        + " " + profile.STR
        + " " + profile.VIT
        + " " + profile.INT
        + " " + profile.PRC
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
                () => EditPage(index)
            ),
            Maybe(
                Button(
                    "Done", () => {
                        task.last = Today()
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

function EditPage(index) {
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
                Button("Add", () => EditPage(-1))
            ),
            ...tasks.map(Task)
        )
    )
}

function ProfilePage() {
    document.body.replaceChildren(
        PaddedPage(
            Button("Back", MainPage),
            Class(
                Horizontal(
                    Class(Header("Level", 1), "stretch"),
                    Header(profile.level, 1),
                ),
                "boxed"
            ),
            Class(
                Horizontal(
                    Class(Header("STR", 1), "stretch"),
                    Header(profile.STR + "/10", 1),
                ),
                "boxed"
            ),
            Class(
                Horizontal(
                    Class(Header("VIT", 1), "stretch"),
                    Header(profile.VIT + "/10", 1),
                ),
                "boxed"
            ),
            Class(
                Horizontal(
                    Class(Header("INT", 1), "stretch"),
                    Header(profile.INT + "/10", 1),
                ),
                "boxed"
            ),
            Class(
                Horizontal(
                    Class(Header("PRC", 1), "stretch"),
                    Header(profile.PRC + "/10", 1),
                ),
                "boxed"
            )
        )
    )
}

function NotifyPage(message) {
    document.body.classList.add("center")
    document.body.replaceChildren(
        Class(
            Vertical(
                Header(message, 1),
                Button("OK", () => {
                    document.body.classList.remove("center")
                    MainPage()
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
        NotifyPage("Penalty received")
    } else {
        MainPage()
    }
}
