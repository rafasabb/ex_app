import { input, confirm } from '@inquirer/prompts';
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filesNames = ['actions.js', 'constants.js', 'reducer.js', 'saga.js', 'service.js', 'index.js'];
const filesWithActions = ['actions.js', 'constants.js', 'reducer.js', 'saga.js'];

/**
 * Get upper cased first character word
 * @param word - The word to transform
 * @returns The word with first character uppercase
 */
function toUpperCaseFirstChar(word) {
    if (word && typeof word === 'string' && word.length > 0) {
        return `${word[0].toUpperCase()}${word.slice(1, word.length)}`;
    }
    return word;
}

const ansewerName = await input({
    message: 'What is the name of your container?', 
})
const ansewerConfirm = await confirm({
    message: 'Do you want to add GET, SUCCESS and ERROR actions?',
})

const templatePath = `${__dirname}/templates`;
const templateFilePathWithActions = `${__dirname}/templatesWithActions`;
const newFilesPath = `${process.cwd()}/src/containers/${ansewerName}Container`;

// Check if template directories exist
if (!fs.existsSync(templatePath)) {
    console.error(`Template directory not found: ${templatePath}`);
    process.exit(1);
}

if (!fs.existsSync(templateFilePathWithActions)) {
    console.error(`Template with actions directory not found: ${templateFilePathWithActions}`);
    process.exit(1);
}

// Create directory if it doesn't exist
try {
    if (!fs.existsSync(newFilesPath)) {
        fs.mkdirSync(newFilesPath);
    }
} catch (error) {
    console.error(`Error creating directory ${newFilesPath}:`, error);
    process.exit(1);
}
createDirectoryContents(templatePath, templateFilePathWithActions, newFilesPath, ansewerName, ansewerConfirm);

function createDirectoryContents(templatePath, templateFilePathWithActions, newFilesPath, containerName, withActions) {
    const filesToCreate = fs.readdirSync(templatePath);
    filesToCreate.forEach(file => {
        const templateFilePath = `${templatePath}/${file}`;
        const fileTemplatePathWithActions = `${templateFilePathWithActions}/${file}`;

        // get stats about the current file
        const stats = fs.statSync(templateFilePath);

        // if directory
        if (stats.isDirectory()) {
            try {
                const dirPath = `${newFilesPath}/${file}`;
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath);
                }
            } catch (error) {
                console.error(`Error creating directory ${newFilesPath}/${file}:`, error);
                return;
            }
            createDirectoryContents(
                templateFilePath,
                templateFilePathWithActions,
                `${newFilesPath}/${file}`,
                containerName,
                withActions,
            );
        }
        // if file
        if (stats.isFile()) {
            let templateFilePathTemp = templateFilePath;
            if (withActions && filesWithActions.includes(file)) {
                console.log('actions templateFilePathWithActions: ' + fileTemplatePathWithActions)
                templateFilePathTemp = fileTemplatePathWithActions;
            }
            console.log('actions path: ' + templateFilePathTemp);
            writeFile(file, containerName, templateFilePathTemp, newFilesPath);
        }
    });
}

/**
 * Write file of template
 * @param file - The file name
 * @param containerName - The container name
 * @param templateFilePath - The template file path
 * @param newFilesPath - The new files path
 */
function writeFile(file, containerName, templateFilePath, newFilesPath) {
    let filename = file;
    if (file === 'CONT_NAME.js') {
        filename = `${containerName}.js`;
    }
    const contents = fs.readFileSync(templateFilePath, 'utf8');

    const writePath = `${newFilesPath}/${filename}`;
    let replacedContents = contents.replace(
        new RegExp(/(CONT_NAME)+/g),
        containerName,
    );
    replacedContents = replacedContents.replace(
        new RegExp(/(CONT_CONTAINER_NAME)+/g),
        `${toUpperCaseFirstChar(containerName)}Container`,
    );
    replacedContents = replacedContents.replace(
        new RegExp(/(CONT_CAMEL_NAME)+/g),
        `${toUpperCaseFirstChar(containerName)}`,
    );
    replacedContents = replacedContents.replace(
        new RegExp(/(CONT_CAPITAL_NAME)+/g),
        `${containerName.toUpperCase()}`,
    );
    try {
        fs.writeFileSync(writePath, replacedContents, 'utf8');
        console.log(`File created successfully: ${writePath}`);
    } catch (error) {
        console.error(`Error writing file ${writePath}:`, error);
    }
}