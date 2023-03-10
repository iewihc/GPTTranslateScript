// ==UserScript==
// @name         ChatGPT: 英文翻譯工具
// @description  自動修改textarea後送出、論文翻譯、語句更改、文法檢查、字典
// @version      1.0.0
// @source       https://github.com/iewihc/GPTTranslateScript/blob/main/userSrcipt.js
// @namespace    https://github.com/iewihc/GPTTranslateScript/blob/main/userSrcipt.js
// @website      https://fullstackladder.dev/
// @author       Chi-Wei Lin
// @run-at       document-end
// @license      MIT
// @match        *://chat.openai.com/chat*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// ==/UserScript==


const fillAndSubmitText = (test) => {
    // 填入 text
    const textarea = document.querySelector("textarea");
    textarea.value = test;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    const button = textarea.parentElement.querySelector("button:last-child");
    button.click();
};

const defaultManualSubmitText = [
    { text: '翻譯論文', template:`請您幫我翻譯以下文章，第一個部份請幫我翻譯成流暢的繁體中文，
第二個部份使用項目符號幫我列出繁體中文和英文的摘要，項目符號的格式為：中文句子 (English Sentence)。
第三個部份請你幫我整理文章中的專有名詞，也應包括英文和繁體中文，用逗號分隔。比如說：蘋果 (Apple), 香蕉 (Banana)的格式。
文章內容如下:
{replace_text} ` },
    { text: 'PARAPHRASE', template: `請你幫我使用英文Paraphrase這段句子，並使用項目符號說明您修改的內容: {{replace_text}} `},
    {
        text: 'DICTIONARY', template: `請您幫我列出這個單字的中文和英文並且 1. 該單字的兩個例句，例句需要包含繁體中文和英文 2. 該單字的五個vocabulary collocations用法 2. 該單字不同詞性，包含其名詞、代名詞、形容詞、動詞、副詞  3. 該單字同義詞和反義詞，單字為：{replace_text} `
    },
    {
        text: 'GRAMMAR', template:`請幫此段 {{replace_text}} 1. 翻譯成繁體中文 2. 請修正這段句子的文法錯誤，並使用項目符號說明您修改的內容 3. 請使用英語，將此句翻寫為更加學術`
    }
];


const addTextToTextarea = (test) => {
    const textarea = document.querySelector("textarea");
    const text = textarea.value;
    const newText = test.replace('{replace_text}', text);
    fillAndSubmitText(newText);
};

const addBottomButtonAndFormatting = ()=>{
    setTimeout(function() {
        let btnDivContainer = document.createElement('div');

        defaultManualSubmitText.forEach((item) => {
            const button = document.createElement("button");
            button.style.border = "1px solid #d1d5db";
            button.style.borderRadius = "5px";
            button.style.padding = "0.5rem 1rem";
            button.style.margin = "0.5rem";

            button.innerText = item.text;
            button.addEventListener('click', function() {
                addTextToTextarea(item.template);
            });

            btnDivContainer.append(button);
        });

        const bottomDiv = document.querySelector('.px-3.pt-2.pb-3.text-center.text-xs.text-black\\/50.dark\\:text-white\\/50.md\\:px-4.md\\:pt-3.md\\:pb-6');

        if (bottomDiv) {
            bottomDiv.innerHTML = '';
            bottomDiv.appendChild(btnDivContainer);
        }

    }, 3000)




}

(function () {
    "use strict";
    addBottomButtonAndFormatting();
})();
