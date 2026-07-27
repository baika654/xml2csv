import { before, describe, mock, it } from 'node:test';
import assert from 'node:assert';
import "./xml2csv.js";
import { DOMParser, window } from './browserMocks.js';

let csvResult;


window.document.addEventListener('click', (event) => {
    event.preventDefault();
    console.log('Document was clicked!');
    // 'event.target' refers to the clicked element
    console.log("URL that points to file to download: ", event.target.getAttribute('href'));
    console.log("Name of the file to download: ", event.target.getAttribute('download'));
    const xmlFileName = event.target.getAttribute('download');
    const csvFileName = xmlFileName.replace(/\.[^/.]+$|$/, `.${"csv"}`)
    console.log(xmlFileName.replace(/\.[^/.]+$|$/, `.${"txt"}`));
    fetch(event.target.getAttribute('href')).then((response) => {
        if (response.ok) {
            response.blob().then((blobObject) => {
                blobObject.arrayBuffer().then((arrayBuffer) => {
                    // Wrap the ArrayBuffer inside a Node.js Buffer
                    const buffer = Buffer.from(arrayBuffer);
                    csvResult(buffer.toString("utf8"));
                });
            });
            const document = window.document;
            const dropZone = document.getElementById('dropZone');
        }
    });
});

const document = window.document;
const dropZone = document.getElementById('dropZone');

if (typeof window !== 'undefined' && !window.DragEvent) {
    class DragEvent extends window.MouseEvent {
        constructor(type, eventInitDict = {}) {
            super(type, eventInitDict);
            this.dataTransfer = eventInitDict.dataTransfer || null;
        }
    }
    global.DragEvent = DragEvent;
    window.DragEvent = DragEvent;
}



describe('When long answer quiz is used', async () => {
    // stuff happens
    // fire a response
    it('should match long answer csv output', async () => {
        const globalActualPromise = new Promise((resolve) => {
            csvResult = resolve;
        });
        const fileContent = `<?xml version="1.0" encoding="UTF-8"?><questestinterop xmlns:d2l_2p0="http://desire2learn.com/xsd/d2lcp_v2p0">\ 
<assessment d2l_2p0:id="1" title="QuizToExport" ident="res_quiz_28212" d2l_2p0:resource_code="F9938D72-D586-466F-84E6-FEADF820534F-156200" > <section ident="CONTAINER_SECTION">\
<section title="TestImport" d2l_2p0:page="1" ident="SECT_646887"><presentation_material><flow_mat><flow_mat><material><mattext texttype="text/html"><p>Testing the import feature</p></mattext>\
</material></flow_mat></flow_mat></presentation_material><sectionproc_extension><d2l_2p0:display_section_name>yes</d2l_2p0:display_section_name><d2l_2p0:display_section_line>no</d2l_2p0:display_section_line>\
<d2l_2p0:type_display_section>1</d2l_2p0:type_display_section></sectionproc_extension><item ident="OBJ_646888" label="QUES_385409_393702" d2l_2p0:page="1" title="This is a written response question"><itemmetadata><qtimetadata>\
<qti_metadatafield><fieldlabel>qmd_computerscored</fieldlabel><fieldentry>yes</fieldentry></qti_metadatafield><qti_metadatafield><fieldlabel>qmd_questiontype</fieldlabel><fieldentry>Long Answer</fieldentry></qti_metadatafield>\
<qti_metadatafield><fieldlabel>qmd_weighting</fieldlabel><fieldentry>1.000000000</fieldentry></qti_metadatafield><qti_metadatafield><fieldlabel>qmd_globalid</fieldlabel><fieldentry>1b30c164-3ff3-4c68-a4bc-8ff8f530762c</fieldentry>\
</qti_metadatafield><qti_metadatafield><fieldlabel>qmd_displayid</fieldlabel><fieldentry>CHEM110-234</fieldentry></qti_metadatafield><qti_metadatafield><fieldlabel>qmd_aihumanorigin</fieldlabel><fieldentry>HumanGenerated</fieldentry>\
</qti_metadatafield></qtimetadata></itemmetadata><itemproc_extension><d2l_2p0:difficulty>7</d2l_2p0:difficulty><d2l_2p0:isbonus>no</d2l_2p0:isbonus><d2l_2p0:ismandatory>no</d2l_2p0:ismandatory></itemproc_extension><presentation><flow>\
<material><mattext texttype="text/html"><p>This is the question text for WR1</p></mattext><matimage d2l_2p0:is_hidden="false" uri="images/LA1.jpg">images/LA1.jpg</matimage></material><response_extension><d2l_2p0:has_signed_comments>no</d2l_2p0:has_signed_comments>\
<d2l_2p0:has_htmleditor>no</d2l_2p0:has_htmleditor><d2l_2p0:has_fileupload>no</d2l_2p0:has_fileupload></response_extension><response_str ident="QUES_385409_393702_STR" rcardinality="Multiple"><render_fib rows="5" columns="80" prompt="Box" fibtype="String">\
<response_label ident="QUES_385409_393702_LA"><material><mattext texttype="text/plain" /></material></response_label></render_fib></response_str></flow></presentation><hint><hintmaterial><flow_mat><material><mattext texttype="text/html"><p>This is the hint text</p></mattext>\
</material></flow_mat></hintmaterial></hint><itemfeedback ident="QUES_385409_393702"><material><mattext texttype="text/html"><p>This is the feedback text</p></mattext></material></itemfeedback><initial_text><initial_text_material><flow_mat><material>\
<mattext texttype="text/plain">This is the initial text</mattext></material></flow_mat></initial_text_material></initial_text><answer_key><answer_key_material><flow_mat><material><mattext texttype="text/html"><p>This is the answer key text</p></mattext>\
</material></flow_mat></answer_key_material></answer_key></item></section></section></assessment></questestinterop >`;

        const mockFile = new File([fileContent], "test-file.xml", { type: "text/plain", });
        const dropEvent = new window.DragEvent("drop", { bubbles: true, cancelable: true, });
        Object.defineProperty(dropEvent, "dataTransfer", { value: { files: [mockFile], items: [{ kind: "file", type: mockFile.type, getAsFile: () => mockFile, },], }, });
        dropZone.dispatchEvent(dropEvent);

        const data = await globalActualPromise;
        const expected = 'NewQuestion,WR\n' +
            'ID,CHEM110-234\n' +
            'Title,This is a written response question\n' +
            'QuestionText,This is the question text for WR1\n' +
            'Points,1.000000000\n' +
            'Difficulty,7\n' +
            'Image,images/LA1.jpg\n' +
            'InitialText,This is the initial text\n' +
            'AnswerKey,This is the answer key text\n' +
            'Hint,This is the hint text\n' +
            'Feedback,This is the feedback text\n' +
            '\n';
        assert.strictEqual(data, expected);
    });
});

describe('When multichoice quiz is used', async () => {
    // stuff happens
    // fire a response
    it('should match multichoice csv output', async () => {
        const globalActualPromise = new Promise((resolve) => {
            csvResult = resolve;
        });
        const fileContent = `<?xml version="1.0" encoding="UTF-8"?><questestinterop xmlns:d2l_2p0="http://desire2learn.com/xsd/d2lcp_v2p0">\ 
<assessment d2l_2p0:id="1" title="QuizToExport" ident="res_quiz_28212" d2l_2p0:resource_code="F9938D72-D586-466F-84E6-FEADF820534F-156200" > <section ident="CONTAINER_SECTION">\
<section title="TestImport" d2l_2p0:page="1" ident="SECT_646887"><presentation_material><flow_mat><flow_mat><material><mattext texttype="text/html"><p>Testing the import feature</p></mattext>\
</material></flow_mat></flow_mat></presentation_material><sectionproc_extension><d2l_2p0:display_section_name>yes</d2l_2p0:display_section_name><d2l_2p0:display_section_line>no</d2l_2p0:display_section_line>\
<d2l_2p0:type_display_section>1</d2l_2p0:type_display_section></sectionproc_extension><item ident="OBJ_646891" label="QUES_385412_393705" d2l_2p0:page="1" title="This is a multiple choice question">\
<itemmetadata><qtimetadata><qti_metadatafield><fieldlabel>qmd_computerscored</fieldlabel><fieldentry>yes</fieldentry></qti_metadatafield><qti_metadatafield>\
<fieldlabel>qmd_questiontype</fieldlabel><fieldentry>Multiple Choice</fieldentry></qti_metadatafield><qti_metadatafield><fieldlabel>qmd_weighting</fieldlabel>\
<fieldentry>1.000000000</fieldentry></qti_metadatafield><qti_metadatafield><fieldlabel>qmd_globalid</fieldlabel><fieldentry>2532e0f6-924e-4a01-8c9e-2d8b9715764d</fieldentry>\
</qti_metadatafield><qti_metadatafield><fieldlabel>qmd_displayid</fieldlabel><fieldentry>CHEM110-237</fieldentry></qti_metadatafield>\
<qti_metadatafield><fieldlabel>qmd_aihumanorigin</fieldlabel><fieldentry>HumanGenerated</fieldentry></qti_metadatafield></qtimetadata></itemmetadata>\
<itemproc_extension><d2l_2p0:difficulty>1</d2l_2p0:difficulty><d2l_2p0:isbonus>no</d2l_2p0:isbonus><d2l_2p0:ismandatory>no</d2l_2p0:ismandatory>\
</itemproc_extension><presentation><flow><material><mattext texttype="text/html"><p>This is the question text for MC1</p></mattext><matimage d2l_2p0:is_hidden="false" uri="images/MC1.jpg">images/MC1.jpg</matimage>\
</material><response_extension><d2l_2p0:display_style>2</d2l_2p0:display_style><d2l_2p0:enumeration>6</d2l_2p0:enumeration><d2l_2p0:grading_type>0</d2l_2p0:grading_type>\
</response_extension><response_lid ident="QUES_385412_393705_LID" rcardinality="Single"><render_choice shuffle="no"><flow_label class="Block">\
<response_label ident="QUES_385412_393705_A1514614"><flow_mat><material><mattext texttype="text/html"><p>This is the correct answer</p></mattext></material>\
</flow_mat></response_label></flow_label><flow_label class="Block"><response_label ident="QUES_385412_393705_A1514615"><flow_mat><material><mattext texttype="text/html"><p>This is incorrect answer 1</p></mattext>\
</material></flow_mat></response_label></flow_label><flow_label class="Block"><response_label ident="QUES_385412_393705_A1514616"><flow_mat><material>\
<mattext texttype="text/html"><p>This is incorrect answer 2</p></mattext></material></flow_mat></response_label></flow_label><flow_label class="Block">\
<response_label ident="QUES_385412_393705_A1514617"><flow_mat><material><mattext texttype="text/html"><p>This is partially correct</p></mattext></material>\
</flow_mat></response_label></flow_label></render_choice></response_lid></flow></presentation><hint><hintmaterial><flow_mat><material><mattext texttype="text/html"><p>This is the hint text</p></mattext>\
</material></flow_mat></hintmaterial></hint><resprocessing><respcondition title="Response Condition 1"><conditionvar><varequal respident="QUES_385412_393705_LID">QUES_385412_393705_A1514614</varequal>\
</conditionvar><setvar action="Set">100.000000000</setvar><displayfeedback feedbacktype="Response" linkrefid="QUES_385412_393705_IF1514614"/></respcondition>\
<respcondition title="Response Condition 2"><conditionvar><varequal respident="QUES_385412_393705_LID">QUES_385412_393705_A1514615</varequal></conditionvar>\
<setvar action="Set">0.000000000</setvar><displayfeedback feedbacktype="Response" linkrefid="QUES_385412_393705_IF1514615"/></respcondition><respcondition title="Response Condition 3">\
<conditionvar><varequal respident="QUES_385412_393705_LID">QUES_385412_393705_A1514616</varequal></conditionvar><setvar action="Set">0.000000000</setvar>\
<displayfeedback feedbacktype="Response" linkrefid="QUES_385412_393705_IF1514616"/></respcondition><respcondition title="Response Condition 4"><conditionvar>\
<varequal respident="QUES_385412_393705_LID">QUES_385412_393705_A1514617</varequal></conditionvar><setvar action="Set">25.000000000</setvar>\
<displayfeedback feedbacktype="Response" linkrefid="QUES_385412_393705_IF1514617"/></respcondition></resprocessing><itemfeedback ident="QUES_385412_393705"><material>\
<mattext texttype="text/html"><p>This is the feedback text</p></mattext></material></itemfeedback><itemfeedback ident="QUES_385412_393705_IF1514614"><material>\
<mattext texttype="text/html"><p>This is feedback for option 1</p></mattext></material></itemfeedback><itemfeedback ident="QUES_385412_393705_IF1514615"><material>\
<mattext texttype="text/html"><p>This is feedback for option 2</p></mattext></material></itemfeedback><itemfeedback ident="QUES_385412_393705_IF1514616"><material>\
<mattext texttype="text/html"><p>This is feedback for option 3</p></mattext></material></itemfeedback><itemfeedback ident="QUES_385412_393705_IF1514617"><material>\
<mattext texttype="text/html"><p>This is feedback for option 4</p></mattext></material></itemfeedback></item></section></section></assessment></questestinterop>`;

        const mockFile = new File([fileContent], "test-file.xml", { type: "text/plain", });
        const dropEvent = new window.DragEvent("drop", { bubbles: true, cancelable: true, });
        Object.defineProperty(dropEvent, "dataTransfer", { value: { files: [mockFile], items: [{ kind: "file", type: mockFile.type, getAsFile: () => mockFile, },], }, });
        dropZone.dispatchEvent(dropEvent);

        const data = await globalActualPromise;
        const expected = 'NewQuestion,MC\n' +
            'ID,CHEM110-237\n' +
            'Title,This is a multiple choice question\n' +
            'QuestionText,This is the question text for MC1\n' +
            'Points,1.000000000\n' +
            'Difficulty,1\n' +
            'Image,images/MC1.jpg\n' +
            'Option,100.000000000,This is the correct answer,This is feedback for option 1\n' +
            'Option,0.000000000,This is incorrect answer 1,This is feedback for option 2\n' +
            'Option,0.000000000,This is incorrect answer 2,This is feedback for option 3\n' +
            'Option,25.000000000,This is partially correct,This is feedback for option 4\n' +
            'Hint,This is the hint text\n' +
            'Feedback,This is the feedback text\n\n';
        assert.strictEqual(data, expected);
    });
});

