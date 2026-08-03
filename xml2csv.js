
import { DOMParser, window } from './browserMocks.js';
import { FileReader } from './filereader.js';
//export { xml2csv };

// const observerCallback = (mutationList, observer) => {
//     for (const mutation of mutationList) {
//         if (mutation.addedNodes !== 'undefined') {
//             const newNodes = mutation.addedNodes;
//             //if ((newNodes.length > 0) && newNodes[0].hasAttribute('href')) {
//             newNodes.forEach((newNode) => {
//                 newNode.addEventListener('click', (event) => {
//                     event.preventDefault();
//                     console.log('Node was clicked!');
//                     // 'event.target' refers to the clicked element
//                     console.log(event.target);
//                 });
//                 console.log('The node has a hyperlink attribute!', (newNode.tagName === 'A' && newNode.hasAttribute('href')));

//             });
//         }
//         if (mutation.type === "childList") {
//             console.log("A child node has been added or removed.");
//         } else if (mutation.type === "attributes") {
//             console.log(`The ${mutation.attributeName} attribute was modified.`);
//         }
//     }
// };

// // 2. Create the observer instance linked to the callback
// const observer = new window.MutationObserver(observerCallback);

// // 3. Configure what changes to watch
// const observerConfig = {
//     attributes: true,         // watch for attribute changes
//     childList: true,          // watch for added/removed nodes
//     subtree: true             // watch the whole tree, not just the target element
// };

// // 4. Start observing a specific target (e.g., document.body)
// const targetNode = window.document.body;
// observer.observe(targetNode, observerConfig);

// <cut-here>

function downloadStringAsFile(text, filename, contentType = 'text/plain') {
    // 1. Create a container for the data (Blob)
    const blob = new Blob([text], { type: contentType });
    // 2. Generate a secure, unique URL pointing to the browser memory
    const url = URL.createObjectURL(blob);
    // 3. Create an in-memory <a> element
    const link = window.document.createElement('a');
    const csvFilename = filename.replace(/\.[^/.]+$|$/, `.${"csv"}`)
    link.href = url;
    link.download = csvFilename; // Sets the default saved filename
    // 4. Force the browser to trigger the download prompt
    window.document.body.appendChild(link);
    link.click();
    // 5. Instantly clean up the DOM and release system memory
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getAnswerFeedback(node) {
    const answerFeedbackNodes = [...node.getElementsByTagName("itemfeedback")].filter((fbItems) => fbItems && fbItems.getAttribute("ident").includes("_IF"));
    if (answerFeedbackNodes === undefined) return [];
    const answerFeedback = answerFeedbackNodes.map((node) => node.getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent);
    return answerFeedback;
}

const xml2csv = () => {
    const document = window.document;
    // document.addEventListener('click', (event) => {
    //     event.preventDefault();
    //     console.log('Document was clicked!');
    //     // 'event.target' refers to the clicked element
    //     console.log("URL that points to file to download: ", event.target.getAttribute('href'));
    //     console.log("Name of the file to download: ", event.target.getAttribute('download'));
    //     const xmlFileName = event.target.getAttribute('download');
    //     const csvFileName = xmlFileName.replace(/\.[^/.]+$|$/, `.${"csv"}`)
    //     console.log(xmlFileName.replace(/\.[^/.]+$|$/, `.${"txt"}`));
    //     fetch(event.target.getAttribute('href')).then((response) => {
    //         if (response.ok) {
    //             response.blob().then((blobObject) => {
    //                 blobObject.arrayBuffer().then((arrayBuffer) => {
    //                     // Wrap the ArrayBuffer inside a Node.js Buffer
    //                     const buffer = Buffer.from(arrayBuffer);

    //                     // Write the file synchronously or asynchronously to disk
    //                     fs.writeFileSync(csvFileName, buffer);
    //                 });
    //             });
    //         }
    //     });
    // });
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    // // 1. Create a container for the data (Blob)
    // const blob = new Blob(["text"], { type: 'text/plain' });
    // // 2. Generate a secure, unique URL pointing to the browser memory
    // const url = URL.createObjectURL(blob);
    // // 3. Create an in-memory <a> element
    // const link = window.document.createElement('a');

    // Prevent default browser behaviors when files are dragged over the window
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Toggle styling states when item hovers over the designated area
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
    });

    // Capture dropped item payloads
    dropZone.addEventListener('drop', handleDrop, false);
    // Capture standard click-and-select file payloads
    fileInput.addEventListener('change', handleFilesSelect, false);

    function handleDrop(e) {
        console.log("Dropping files");
        const dt = e.dataTransfer;
        const items = dt.items;
        console.log("Number of files dropped is ", items.length);
        handleItems(items);
    }

    function handleFilesSelect(e) {
        const items = e.target.items;
        handleItems(items);
    }

    function handleItems(items) {

        //console.log('Files dropped:', event.dataTransfer.files.length);
        //console.log('File Name:', event.dataTransfer.files[0].name);
        //console.log('Items dropped', event.dataTransfer.items.length);
        //console.log('Item Name:', event.dataTransfer.items[0].name);

        const fileItems = [...items];
        fileItems.forEach((item) => {
            let file;
            if (item.kind === "file") {
                file = item.getAsFile();
                //file.text().then((value) => {
                //    console.log('Item (as file) text is:', value);
                //    //console.log(value);   // Expected output: "Success!"
                //});
                //console.log('Item (as file) text is:', file.text);



                const oldFileName = file.name;
                const reader = new FileReader();

                // Define what happens once the file reading completes
                reader.onload = function (event) {
                    const xmlString = event.target.result;
                    console.log("File text reads as: ", xmlString);

                    const result = createStringFromXML(xmlString);
                    downloadStringAsFile(result, oldFileName);

                };


                // Read the file structure as plain text
                reader.readAsText(file);
            }
        });
    }

    //const dataTransfer = new window.DataTransfer();
    //const file = new File(['sample content'], 'sample.txt', { type: 'text/plain' });
    //dataTransfer.items.add(file);

    // if (typeof window !== 'undefined' && !window.DragEvent) {
    //     class DragEvent extends window.MouseEvent {
    //         constructor(type, eventInitDict = {}) {
    //             super(type, eventInitDict);
    //             this.dataTransfer = eventInitDict.dataTransfer || null;
    //         }
    //     }
    //     global.DragEvent = DragEvent;
    //     window.DragEvent = DragEvent;
    // }

    //const mockFile = new File(["*********file content here***************"], "test-file.txt", { type: "text/plain", });
    //const dropEvent = new window.DragEvent("drop", { bubbles: true, cancelable: true, });
    //Object.defineProperty(dropEvent, "dataTransfer", { value: { files: [mockFile], items: [{ kind: "file", type: mockFile.type, getAsFile: () => mockFile, },], }, });
    //dropZone.dispatchEvent(dropEvent);

    const questionDict = { "Long Answer": "WR", "Short Answer": "SA", "Matching": "M", "Multiple Choice": "MC", "True/False": "TF", "Multi-Select": "MS", "Ordering": "O" }

    function createStringFromXML(xmlString) {


        const getQuestionData = (question) => {
            let subString = "";
            const metadatafields = question.getElementsByTagName("qti_metadatafield");
            const questionType = metadatafields[1].getElementsByTagName("fieldentry")[0].textContent;
            switch (questionDict[questionType]) {
                case "WR":
                    subString = subString + "InitialText,";
                    subString = subString + question.getElementsByTagName("initial_text_material")[0].getElementsByTagName("flow_mat")[0].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent;
                    subString = subString + "\nAnswerKey,";
                    subString = subString + question.getElementsByTagName("answer_key_material")[0].getElementsByTagName("flow_mat")[0].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent;
                    subString = subString + "\n";
                    break;
                case "SA":
                    subString = subString + "Answer(s)," + question.getElementsByTagName("varequal")[0].textContent + ",";
                    if (question.getElementsByTagName("d2l_2p0:answer_is_regexp")[0] === "yes") {
                        subString = subString + "regex";
                    }
                    subString = subString + "\nInputBox," + question.getElementsByTagName("render_fib")[0].getAttribute("rows") + "," + question.getElementsByTagName("render_fib")[0].getAttribute("columns") + "\n"; // Code runs if expression === value2
                    break;
                case "MC":
                    const scores = question.getElementsByTagName("setvar");
                    const options = question.getElementsByTagName("response_label"); //[0].getElementsByTagName("flow_mat")[0].getElementsByTagName("material")[0].getElementsByTagName("mattext");
                    const feedback = question.getElementsByTagName("itemfeedback");
                    const answerFeedback = getAnswerFeedback(question);
                    for (let i = 0; i < scores.length; i++) {
                        const optionsText = options[i].getElementsByTagName("flow_mat")[0].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent;
                        //const feedbackText = feedback[i + 1].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent;
                        //subString = subString + "Option," + scores[i].textContent + "," + options[i].getElementsByTagName("flow_mat")[0].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent + "," + feedback[i + 1].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent + "\n";
                        let feedbackText;
                        //if (feedback.length > 1) {
                        //feedbackText = feedback[i + 1].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent;
                        if (answerFeedback.length > 0) {
                            feedbackText = answerFeedback[i];
                        } else {
                            feedbackText = "";
                        }

                        //subString = subString + "Option," + scores[i].textContent + "," + options[i].getElementsByTagName("flow_mat")[0].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent + "," + feedback[i + 1].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent + "\n";
                        const optionString = /*subString + */ "Option," + scores[i].textContent + "," + optionsText + "," + feedbackText + "\n";
                        subString = subString + optionString.replace(/[\r\n]+/gm, "") + "\n";
                    }
                    //Scoring is set by <setvar ….>[getText]
                    //Options              <response_label><flow_mat><material><mattext>[getText]
                    break;
                case "MS": {
                    const scores = {};
                    const gradingType = question.getElementsByTagName("d2l_2p0:grading_type")[0].textContent;
                    console.log("Grading type:", gradingType);
                    switch (gradingType) {
                        case "0": {
                            const rightAnswer = question.getElementsByTagName("respcondition");
                            const options = question.getElementsByTagName("response_label");
                            const feedback = question.getElementsByTagName("itemfeedback");
                            const answerFeedback = getAnswerFeedback(question);
                            let answerValues;
                            subString = subString + "Scoring,RightAnswers\n";
                            //subString = subString + rightAnswer.length + "," + options.length + "," + feedback.length + "\n";
                            console.log(answerFeedback, ":", answerFeedback.length, ":", options.length, "  RightAnswer:", rightAnswer.length, " Array:", rightAnswer);
                            for (let j = 0; j < options.length; j++) {
                                scores[options[j].getAttribute("ident")] = { "index": j, "score": 0 };
                            }
                            for (let k = 0; k < rightAnswer.length; k++) {
                                if (rightAnswer[k].getAttribute("title") == "Scoring for the correct answers") {
                                    answerValues = rightAnswer[k].getElementsByTagName("varequal");
                                    for (let l = 0; l < answerValues.length; l++) {
                                        if (answerValues[l].parentElement.tagName == "not") {
                                            console.log("Question ", answerValues[l].textContent, " is wrong");
                                        } else {
                                            console.log("Question ", answerValues[l].textContent, " is right");
                                            scores[answerValues[l].textContent].score = 1;

                                        }
                                    }
                                }
                            }
                            console.log(scores);
                            for (let i = 0; i < options.length; i++) {
                                const key = Object.keys(scores).find(k => scores[k].index === i);
                                const answerScore = scores[key].score;
                                let feedbackText;
                                if (answerFeedback.length > 0) {
                                    feedbackText = answerFeedback[i];
                                } else {
                                    feedbackText = "";
                                }
                                //subString = subString + "Option," + (rightAnswer[i].getElementsByTagName("setvar")[0].getAttribute("varname") == "D2L_Correct" ? "1" : "0") + "," + options[i].getElementsByTagName("flow_mat")[0].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent + "," + feedback[i + 1].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent + "\n";
                                const optionString = /*subString +*/ "Option," + answerScore + "," /*+ (rightAnswer[i].getElementsByTagName("setvar")[0].getAttribute("varname") == "D2L_Correct" ? "1" : "0") + "," */ + options[i].getElementsByTagName("flow_mat")[0].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent + "," + feedbackText; // + "\n";
                                subString = subString + optionString.replace(/[\r\n]+/gm, "") + "\n";

                            }

                        }
                            break;
                        case "1": { }
                            break;
                        case "2": { }
                            break;
                        case "3": { }
                            break;
                        default: { }
                    }
                }
                    break;
                case "M":
                    const choice = question.getElementsByTagName("response_grp");
                    const renderChoice = choice[0].getElementsByTagName("render_choice");
                    const match = renderChoice[0].getElementsByTagName("mattext");
                    const respcondition = question.getElementsByTagName("respcondition");
                    const matchingMap = {};
                    subString = subString + "Scoring,EquallyWeighted\n";
                    for (let i = 0; i < choice.length; i++) {
                        subString = subString + "Choice," + i + "," + choice[i].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent + "\n";
                    }
                    for (let i = 0; i < choice.length; i++) {
                        for (let j = 0; j < choice.length; j++) {
                            if (respcondition[(i * 3) + j].getElementsByTagName("setvar")[0].getAttribute("varname") == "D2L_Correct") {
                                matchingMap[j] = i + 1;
                            }
                        }
                    }
                    for (let i = 0; i < match.length; i++) {
                        subString = subString + "Match," + matchingMap[i] + "," + match[i].textContent + "\n";
                    }
                    break;
                case "TF":
                    {
                        //const rightAnswer = question.getElementsByTagName("respcondition");
                        const trueFalse = question.getElementsByTagName("response_label");
                        const scores = question.getElementsByTagName("setvar");
                        const feedback = question.getElementsByTagName("itemfeedback");
                        subString = subString + "Scoring,RightMinusWrong\n";
                        //subString = subString + rightAnswer.length + "," + options.length + "," + feedback.length + "\n";
                        for (let i = 0; i < trueFalse.length; i++) {
                            subString = subString + trueFalse[i].getElementsByTagName("flow_mat")[0].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent + "," + scores[i].textContent + "," + feedback[i + 1].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent + "\n";
                        }
                    }
                    break;
                case "O":
                    {
                        //const rightAnswer = question.getElementsByTagName("respcondition");
                        const items = question.getElementsByTagName("response_label");
                        const feedback = question.getElementsByTagName("itemfeedback");
                        subString = subString + "Scoring,RightMinusWrong\n";
                        //subString = subString + rightAnswer.length + "," + options.length + "," + feedback.length + "\n";
                        for (let i = 0; i < items.length; i++) {
                            subString = subString + "Item," + "," + items[i].getElementsByTagName("flow_mat")[0].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent + "," + feedback[i + 1].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent + "\n";
                        }
                    }
                    break;
                default:
                    subString = subString + "**********\n**********\n";
            }
            return subString;
        }


        // Read the file synchronously and save it into a string variable
        let outputString = "";

        //const xmlString = fs.readFileSync('quiz_d2l_28212.xml', 'utf8');

        //console.log("XML content successfully loaded into variable:");
        const parser = new DOMParser();

        // 3. Parse the string into an XML Document object
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        // 4. Query and interact with the XML DOM exactly like regular HTML DOM
        //const title = xmlDoc.querySelector("title").textContent;
        //console.log(title); // Output: The Hobbit

        const xpath = '//section[@ident="CONTAINER_SECTION"]';
        const result = xmlDoc.evaluate(xpath, xmlDoc, null, /*XPathResult.FIRST_ORDERED_NODE_TYPE*/ 9, null);
        //console.log(result);
        const questionBlock = result.singleNodeValue;

        /*if (questionBlock) {
            // Serialize the DOM node back to a string
            //const serializer = new XMLSerializer();
            console.log(xmlserializer.serializeToString(questionBlock));
        }*/

        const questions = questionBlock.getElementsByTagName("item");
        console.log(questions.length);


        // Loop through the matching "item" elements
        for (let i = 0; i < questions.length; i++) {
            //const question = questions[i];

            const metadatafields = questions[i].getElementsByTagName("qti_metadatafield");
            const questionImageList = questions[i].getElementsByTagName("matimage");
            let questionImage;
            if (questionImageList.length > 0) {
                questionImage = questionImageList[0].textContent;
            } else {
                questionImage = "";
            }
            const difficulty = questions[i].getElementsByTagName("d2l_2p0:difficulty")[0].textContent;
            const feedback = questions[i].getElementsByTagName("itemfeedback")[0].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent.replace(/[\r\n]+/gm, "");
            //const hint = questions[i].getElementsByTagName("hintmaterial")[0].getElementsByTagName("flow_mat")[0].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent;
            let hint;
            const hintList = questions[i].getElementsByTagName("hintmaterial");
            if (hintList.length > 0) {
                hint = hintList[0].getElementsByTagName("flow_mat")[0].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent;
            } else {
                hint = "";
            }
            const questionText = questions[i].getElementsByTagName("presentation")[0].getElementsByTagName("flow")[0].getElementsByTagName("material")[0].getElementsByTagName("mattext")[0].textContent.replace(/[\r\n]+/gm, "");
            const questionTitle = questions[i].getAttribute("title");
            const questionType = metadatafields[1].getElementsByTagName("fieldentry")[0].textContent;
            const weighting = metadatafields[2].getElementsByTagName("fieldentry")[0].textContent;
            const iD = metadatafields[4].getElementsByTagName("fieldentry")[0].textContent;
            //console.log("questionTitle:", questionTitle, " questionType :", questionType, " weighting:", weighting, " ID:", iD, " Image:", questionImage, " Difficulty:", difficulty, " Feedback:", feedback, " Hint:", hint, " Question Text:", questionText);
            outputString = outputString + "NewQuestion," + questionDict[questionType] + "\nID," + iD + "\nTitle," + questionTitle + "\nQuestionText," + questionText + "\n";
            outputString = outputString + "Points," + weighting + "\nDifficulty," + difficulty + "\nImage," + questionImage + "\n";
            outputString = outputString + getQuestionData(questions[i]);
            outputString = outputString + "Hint," + hint + "\nFeedback," + feedback + "\n\n";

        }
        console.log(outputString);
        const doc = parser.parseFromString(outputString, "text/html");
        return doc.body.textContent || "";

    }

    // link.href = url;
    // link.download = "test.txt" // filename; // Sets the default saved filename
    // // 4. Force the browser to trigger the download prompt
    // window.document.body.appendChild(link);
    // link.click();
    // // 5. Instantly clean up the DOM and release system memory
    // window.document.body.removeChild(link);
    // URL.revokeObjectURL(url);
}

xml2csv();
//createStringFromXML();

/*

// 1. Your original unsorted Map
const originalMap = new Map([
  ['apple', 10],
  ['banana', 5],
  ['cherry', 20]
]);

// 2. Sort by value (Ascending order)
const sortedAsc = new Map([...originalMap.entries()].sort((a, b) => a[1] - b[1]));

// 3. Sort by value (Descending order)
const sortedDesc = new Map([...originalMap.entries()].sort((a, b) => b[1] - a[1]));


const userMap = new Map([
  ['userA', { age: 25, name: 'Alice' }],
  ['userB', { age: 19, name: 'Bob' }],
  ['userC', { age: 31, name: 'Charlie' }]
]);

// Sort by the 'age' property inside the value object
const sortedByAge = new Map([...userMap].sort((a, b) => a[1].age - b[1].age));
*/