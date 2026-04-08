#!/usr/bin/env node

/**
 * Reset the project to a blank state.
 * Moves or deletes the /app, /components, /hooks, /scripts, and /constants
 * directories, then creates a new /app with starter files.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const root = process.cwd();
const oldDirs = ["app", "components", "hooks", "constants", "scripts"];
const exampleDir = "app-example";
const newAppDir = "app";
const exampleDirPath = path.join(root, exampleDir);
const currentScriptDir = path.resolve(__dirname);

const indexContent = `import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
`;

const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const isSamePath = (left, right) =>
  path.resolve(left).toLowerCase() === path.resolve(right).toLowerCase();

const moveWithFallback = async (sourcePath, destinationPath) => {
  if (fs.existsSync(destinationPath)) {
    throw new Error(
      `Cannot move ${path.basename(sourcePath)} because ${path.relative(
        root,
        destinationPath
      )} already exists. Delete that folder and rerun the script.`
    );
  }

  try {
    await fs.promises.rename(sourcePath, destinationPath);
  } catch (error) {
    if (["EPERM", "EACCES", "EXDEV"].includes(error.code)) {
      await fs.promises.cp(sourcePath, destinationPath, { recursive: true });
      await fs.promises.rm(sourcePath, { recursive: true, force: true });
      return;
    }

    throw error;
  }
};

const moveDirectories = async (userInput) => {
  const skippedDirs = [];

  try {
    if (userInput === "y") {
      await fs.promises.mkdir(exampleDirPath, { recursive: true });
      console.log(`Created /${exampleDir}.`);
    }

    for (const dir of oldDirs) {
      const oldDirPath = path.join(root, dir);

      if (!fs.existsSync(oldDirPath)) {
        console.log(`/${dir} does not exist, skipping.`);
        continue;
      }

      if (isSamePath(oldDirPath, currentScriptDir)) {
        skippedDirs.push(dir);
        console.log(
          `/${dir} skipped because this script is currently running from that directory.`
        );
        continue;
      }

      if (userInput === "y") {
        const newDirPath = path.join(root, exampleDir, dir);
        await moveWithFallback(oldDirPath, newDirPath);
        console.log(`Moved /${dir} to /${exampleDir}/${dir}.`);
      } else {
        await fs.promises.rm(oldDirPath, { recursive: true, force: true });
        console.log(`Deleted /${dir}.`);
      }
    }

    const newAppDirPath = path.join(root, newAppDir);
    await fs.promises.mkdir(newAppDirPath, { recursive: true });
    console.log("\nCreated new /app directory.");

    const indexPath = path.join(newAppDirPath, "index.tsx");
    await fs.promises.writeFile(indexPath, indexContent);
    console.log("Created app/index.tsx.");

    const layoutPath = path.join(newAppDirPath, "_layout.tsx");
    await fs.promises.writeFile(layoutPath, layoutContent);
    console.log("Created app/_layout.tsx.");

    console.log("\nProject reset complete. Next steps:");
    console.log(
      `1. Run \`npx expo start\` to start a development server.\n2. Edit app/index.tsx to edit the main screen.${
        userInput === "y"
          ? `\n3. Delete /${exampleDir} when you're done referencing it.`
          : ""
      }`
    );

    if (skippedDirs.length > 0) {
      console.log(
        `4. Remove /${skippedDirs.join(
          ", /"
        )} manually after this script exits if you still want it cleaned up.`
      );
    }
  } catch (error) {
    console.error(
      `Error during script execution: ${error.message}\n` +
        "If this is a Windows permission error, close Expo/Metro, editors, and terminals using this project, then rerun the script."
    );
  }
};

rl.question(
  "Do you want to move existing files to /app-example instead of deleting them? (Y/n): ",
  (answer) => {
    const userInput = answer.trim().toLowerCase() || "y";

    if (userInput === "y" || userInput === "n") {
      moveDirectories(userInput).finally(() => rl.close());
      return;
    }

    console.log("Invalid input. Please enter 'Y' or 'N'.");
    rl.close();
  }
);
