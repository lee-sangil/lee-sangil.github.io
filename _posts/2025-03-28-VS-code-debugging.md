---
title: "Debugging C++ with VS Code"
categories:
 - ETC
tags:
 - c++
 - vscode
 - tasks
 - launch
 - macos
header:
  teaser: /assets/image/thumbnail/2025-03-28-vscode-debugging.jpg
excerpt_separator: <!--more-->
---

> This post explains how to configure a debugging environment in Visual Studio Code (VS Code). While the settings described are for macOS, they can be easily adapted for Windows with minimal changes, such as the compiler. VS Code uses tasks.json and launch.json for build and debug configurations. I'll explain how to set up these files and use them.

<!--more-->

## Tasks Configuration (tasks.json)

The tasks.json file defines automated tasks in VS Code. Below is an example configuration for building C++ code:

```json
// tasks.json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build", // The name of the task. It is referenced in launch.json as preLaunchTask.
            "type": "shell", // The type of task. "shell" indicates the task runs in the terminal.
            "command": "g++", // The command to run. Here, the GNU C++ compiler is used.
            "args": [
                "-std=c++17", // Specifies the C++17 standard.
                "-g", // Generates debugging information.
                "${fileDirname}/*.cpp", // Compiles all .cpp files in the current directory.
                "-o",
                "${workspaceFolder}/build/main" // Specifies the output path and executable name.
            ],
            "group": "build" // Assigns this task to the 'build' group.
        }
    ]
}
```


**Explanation**

- `"command": "g++"`: the GNU C++ compiler is used to compile source files.
- `-std=c++17`: uses the C++17 standard.
- `-g`: includes debugging information.
- `"${fileDirname}/*.cpp"`: targets all .cpp files in the current directory.
- `-o "${workspaceFolder}/build/main"`: sets the output executable path.
- `"label": "build"`: sets the name of the task. This label can be used in the launch.json file to trigger the build task before debugging.

## Debug Configuration (launch.json)

The launch.json file sets up the debugging environment in VS Code:

```json
// launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "debug", // Name of the debugging configuration, shown in VS Code.
            "type": "cppdbg", // Specifies the C++ debugger type.
            "request": "launch", // Indicates whether to launch a program or attach to a running process.
            "program": "${workspaceFolder}/build/main", // Path to the executable to debug.
            "args": [], // Arguments to pass to the program when it starts.
            "stopAtEntry": false, // Whether to break at the entry point of the program.
            "cwd": "${fileDirname}", // Sets the current working directory.
            "environment": [], // Defines environment variables for the debugging session.
            "externalConsole": false, // Uses the internal VS Code console instead of an external one.
            "MIMode": "lldb", // Specifies the debugger backend (LLDB for macOS).
            "preLaunchTask": "build" // Runs the "build" task before starting the debugger.
        }
    ]
}
```


**Explanation**

- `"program"`: specifies the built executable to run in the debugger.
- `"preLaunchTask": "build"`: runs the "build" task before starting the debugging session.
- `"MIMode": "lldb"`: uses LLDB, which is the default debugger on macOS.

## How to Use

1. Open the debugging tab in VS Code.
2. Select the "debug" configuration from the dropdown menu.
3. Click the green play button to start debugging.
4. Make sure VS Code uses the above configuration files rather than the default file.

 VS Code will first build the project using the tasks.json configuration. Once the build is complete, the debugger will launch the executable.