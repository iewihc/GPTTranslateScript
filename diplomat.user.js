// ==UserScript==
// @name         ChatGPT: 外交官
// @description  打入斜線「/」可以產生出預設的右上方指令template; 下方按鈕可以協助prompt生成; 註冊全局點擊右鍵可以的總結文章、翻譯文本prompt
// @version      3.6.0
// @source       https://raw.githubusercontent.com/iewihc/GPTTranslateScript/main/diplomat.user.js
// @namespace    https://github.com/iewihc/GPTTranslateScript/
// @updateURL    https://raw.githubusercontent.com/iewihc/GPTTranslateScript/main/diplomat.user.js
// @downloadURL  https://raw.githubusercontent.com/iewihc/GPTTranslateScript/main/diplomat.user.js
// @website      https://fullstackladder.dev/
// @author       Chi-Wei Lin
// @run-at       document-end
// @license      MIT
// @match        http://*/*
// @match        https://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.registerMenuCommand
// ==/UserScript==

// ChatGPT 畫面產生後，還不會立刻取得 Acccess Token，這會導致送出失敗
// 目前的解決方式是檢查左邊 sidebar 是否已經讀取完，如果讀取完代表 Access Token 已經有了
const checkCanAccess = () => {
  const xpath = `//*[contains(text(), 'Not seeing what you expected here?')]`;
  const result = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  return result.snapshotLength == 0;
};

const bottomOptions = [
  {
    text: 'Originial', template: `Ignore all the instructions you got before. 從現在開始您是一名優秀的翻譯人員，我會給您文章，
並分成三個部份回答我
第一個部份請幫我翻譯成流暢的繁體中文，並在標題輸入「第一部分」
第二個部份使用項目符號幫我列出繁體中文和英文的摘要，五個項目就可以了，中文與英文麻煩幫我同時列在同一個點上，其格式為：中文句子 (English Sentence)，並在標題輸入「第二部分」。
第三個部份請你幫我整理文章中除了地名和人名之外的專業術語，也應包括英文和繁體中文，用逗號分隔。比如說：蘋果 (Apple), 香蕉 (Banana)的格式，並在標題輸入「第三部分」。
文章內容如下:
「{replace_text}」 `
  },
  {
    text: '做筆記',
    template: `Please ignore all the instructions you received previously. From now on, you will act as a student. You must utilize note-taking skills to help me list all the key points into bullet points. Please ensure that you do not miss any important information, and add a traditional Chinese translation to the list of key points. Make sure that each bullet point contains both English and traditional Chinese. After that, help me by putting it in bold, in professional terms in each bullet point. When you have finished, please provide a quick summary in both English and traditional Chinese for me. 「{replace_text}」`
  },
  {
    text: '翻譯中文',
    template: `#zh-TW Please ignore all the instructions you received previously. From now on, you will be acting as a translator to help me translate the article into fluent traditional Chinese as follows.「{replace_text}」`
  },
  {
    text: '項目摘要',
    template: `#zh-TW 請你繼續根據本篇文章，使用項目符號幫我列出繁體中文和英文的摘要，中文與英文麻煩幫我同時列在同一個點上，其格式為：中文句子 (English Sentence)，並在標題輸入「項目摘要」。`
  },
  {
    text: '深難詞彙', template: `請你繼續根據本篇文章，幫我整理出這篇文章的深難字彙，需要包含繁體中文和英文。`
  },
  {
    text: '一句話概述', template: `請你用一句話簡短的概述本篇文章在講什麼，需要英文和繁體中文，其格式為：中文句子 (English Sentence) 並在標題輸入「概述」`
  },
  {text: 'PARAPHRASE', template: `請你幫我使用英文Paraphrase這段句子，並使用項目符號說明您修改的內容: 「{replace_text}」 `},
  {
    text: 'DICTIONARY',
    template: `請您幫我列出此單字的中文和英文以其他的詞根詞綴解釋 1. 該單字的兩個例句，例句需要包含繁體中文和英文 2. 該單字的五個vocabulary collocations用法 2. 該單字不同詞性，包含其名詞、代名詞、形容詞、動詞、副詞  3. 該單字同義詞和反義詞，單字為：「{replace_text}」 `
  },
  {
    text: 'GRAMMAR',
    template: `Please ignore all the instructions you received previously. 請幫此段 {replace_text} 1. 翻譯成繁體中文 2. 請修正這段英文句子的文法錯誤 3.使用項目符號說明您修改的內容 4. 請使用英語，將此句翻寫為更加學術`
  },
  {
    text: 'GRAMMAR TABLE',
    template: `Do a grammar check, Spelling check, Writing suggestions, Expression check and Translation check, use a table to highlight the wrong sentences and also provide a traditional-Chinese suggested correction. :「{replace_text}」`
  }
];

const commandOptions = [
  {
    cmd: "/PERFORMANCE",
    prompt: `#zh-TW Please ignore all previous instructions. From now on, you act as an system architect experts.  Please help me optimize the performance of the code:`
  },
  {
    cmd: "/D-PRINCIPLES",
    prompt: `#zh-TW Please ignore all previous instructions. From now on, you act as an system architect experts.  Please help me optimize this code based on the famous 23 design principles and let me know which design principle you used: `
  },
  {
    cmd: "/UNITTEST",
    prompt: `#zh-TW Please ignore all previous instructions. From now on, you are now a programming language expert. Please help me write a test project by using NUnit. Please provide at least two test cases to ensure that the output of this code is correct: `
  },
  {
    cmd: "/REFACTOR",
    prompt: `#zh-TW Please ignore all previous instructions. From now on, you act as an clean code experts. Please rewrite it in a cleaner and simpler way so that my colleagues can maintain the code more easily. Also, please explain in one simple sentence why you are refactoring in this way: `
  },
  {
    cmd: "/SUGGESTION",
    prompt: `#zh-TW Please ignore all previous instructions. From now on, you act as a senior coder expert. Pose as a specialist in c# who can fluently speak. Evaluate the below-metioned c# code and furnish some suggestion with regards to better Readability, Maintainability and performance: `
  }

]

const menuOptions = [
  {
    cmd: "TRANSLATE",
    prompt: `請您幫我以下單字的中文和英文以其他的詞根詞綴解釋 1. 該單字的兩個例句，例句需要包含繁體中文和英文 2. 該單字的五個vocabulary collocations用法 2. 該單字不同詞性，包含其名詞、代名詞、形容詞、動詞、副詞  3. 該單字同義詞和反義詞，單字為：`
  },
  {
    cmd: '翻譯文本',
    prompt: `#zh-TW 請你繼續根以下內容，1. 翻譯為流暢的繁體中文，2. 幫我使用一句話概述 ，內容為：`
  },
  {
    cmd: '項目摘要',
    prompt: `#zh-TW 請你繼續根以下內容，使用項目符號幫我列出繁體中文和英文的摘要，中文與英文麻煩幫我同時列在同一個點上，其格式為：中文句子 (English Sentence)，並在標題輸入「項目摘要」。 內容為：`
  },
]

const afterTextOptions = [
  // continue
  {text: "繼續", value: "請從中斷的地方繼續"},
  {text: "換一個", value: "我不喜歡這個用法，請換一個用法"},
  {text: "斷句", value: "這個句子太長了，請幫我斷句"}
];


const addAfterTextButtonsToSendDefaultMessage = () => {
  let globalButtons = [];
  let buttonsArea = null;


  const main = document.querySelector("body");
  const obs = new MutationObserver(() => {
    // 尋找聊天記錄的最後一筆，用來插入按鈕
    const talkBlocks = document.querySelectorAll(
      ".text-base.gap-4.md\\:gap-6.m-auto.md\\:max-w-2xl.lg\\:max-w-2xl.xl\\:max-w-3xl.p-4.md\\:py-6.flex.lg\\:px-0:not(.custom-buttons-area)"
    );
    if (!talkBlocks || !talkBlocks.length) {
      return;
    }

    // 要被插入按鈕的區塊
    const talkBlockToInsertButtons = talkBlocks[talkBlocks.length - 1];

    // 先停止觀察，避免自訂畫面變更被觀察到
    stop();

    // 先將原來動態加入的內容移除

    // remove custom buttons
    globalButtons.forEach((button) => button.remove());
    globalButtons = [];

    // remove buttons area
    if (buttonsArea) {
      buttonsArea.remove();
    }

    // 重新將按鈕區和按鈕移除

    // create a new buttons area
    buttonsArea = document.createElement("div");
    buttonsArea.classList =
      "custom-buttons-area text-base m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl p-4 md:py-6 flex lg:px-0";
    buttonsArea.style.overflowY = "auto";
    buttonsArea.style.display = "flex";
    buttonsArea.style.flexWrap = "wrap";
    buttonsArea.style.paddingTop = 0;
    buttonsArea.style.paddingLeft = "calc(30px + 0.75rem)";
    talkBlockToInsertButtons.after(buttonsArea);

    // add buttons
    afterTextOptions.forEach((item) => {

      let lastText = talkBlockToInsertButtons.innerText;

      const isPunctuation = (str) => {
        const punctuationRegex = /^(?![，,：:])[\p{P}\p{S}]$/u;
        return punctuationRegex.test(str);
      }

      // 最後一個字元如果是標點符號，就不要顯示「繼續」
      if (isPunctuation(lastText.charAt(lastText.length - 1)) && item.text == '繼續') {
        return;
      }

      const button = document.createElement("button");
      button.style.border = "1px solid #d1d5db";
      button.style.borderRadius = "5px";
      button.style.padding = "0.5rem 1rem";
      button.style.margin = "0.5rem";

      button.innerText = item.text;
      button.addEventListener("click", () => {
        fillAndSubmitText(item.value);
      });

      buttonsArea.append(button);
      globalButtons.push(button);
    });

    // 重新開始觀察
    start();
  });

  const start = () => {
    obs.observe(main.parentElement, {
      childList: true,
      attributes: true,
      subtree: true,
    });
  };
  const stop = () => {
    obs.disconnect();
  };

  start();
};

const autoFillFromSegment = () => {

    const params = new URLSearchParams(location.search);
    const prompt = params.get('prompt'); // 'prompt'
    const autoSubmit = params.get('autoSubmit'); // 'true'
    alert(prompt);



  // 沒有 prompt 就不用作任何事情
  if (!prompt) {
    return;
  }

  /**
   * 等待 focus 到訊息輸入框就開始初始化功能
   */
  const it = setInterval(() => {
    const textarea = document.activeElement;
    if (
      textarea.tagName === "TEXTAREA" &&
      textarea.nextSibling.tagName === "BUTTON" &&
      checkCanAccess()
    ) {
      // 預設的送出按鈕
      const button = textarea.parentElement.querySelector("button:last-child");

      // 填入 prompt
      textarea.value = prompt;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length); //將選擇範圍設定為文本的末尾
      textarea.scrollTop = textarea.scrollHeight; // 自動捲動到最下方

      // auto submit
      if (autoSubmit == "1" || autoSubmit == "true") {
        // workaround, 還沒拿到 token 前不送出, 目前無法判斷何時取得 token, 先等一秒
        //           setTimeout(() => {
        button.click();
        //           }, 1000);
      }

      // 移掉 segment 的參數
      history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search
      );

      clearInterval(it);
    }
  }, 60);
};


const openChatGPT = async (basePrompt, text) => {
  // 設定 prompt 並打開 ChatGPT
  const prompt = `${basePrompt}\n\n${text}`;
  await GM.setValue("prompt", prompt);
  window.open("https://chat.openai.com/chat", "_blank");
};

const getSelectionText = () => {
  let selectedText = "";
  if (window.getSelection) {
    selectedText = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
    selectedText = document.selection.createRange().text;
  }
  return selectedText;
};

const registerMenu = async () => {
  for (const {cmd, prompt} of menuOptions) {
    GM.registerMenuCommand(
      cmd,
      async () => {
        const text = getSelectionText();

        // 有 text 標籤才處理
        if (text) {
          openChatGPT(prompt, text);
        }
      },
      "t"
    );
  }
};

//


// 預設要顯示的按鈕和文字範本
const fillAndSubmitText = (test) => {
  // 取得 textarea 元素並設定 value
  const textarea = document.querySelector("textarea");
  // 觸發 input 事件
  textarea.value = test;
  // 取得送出按鈕並點擊
  textarea.dispatchEvent(new Event("input", {bubbles: true}));

  const button = textarea.parentElement.querySelector("button:last-child");
  button.click();
};

// 透過傳入的文字來替換 textarea 中的指定文字後再提交
const addTextToTextarea = (test) => {
  const textarea = document.querySelector("textarea");
  const text = textarea.value;
  const newText = test.replace('{replace_text}', text);
  fillAndSubmitText(newText);
};


// 新增底部按鈕，並設定格式，點擊按鈕時會將對應的文字插入到 textarea 中
const addBottomButtonAndFormatting = () => {
  const bottomDiv = document.querySelector('.absolute.bottom-0.left-0');
  const versionDiv = document.querySelector('.px-3.pt-2.pb-3.text-center.text-xs.text-gray-600.dark\\:text-gray-300.md\\:px-4.md\\:pt-3.md\\:pb-6');
  const spanElement = versionDiv.querySelector('span');
  spanElement.remove();
  versionDiv.remove();
  if (!bottomDiv) {
        return;
  }


    const btnDivContainer = document.createElement('div');
    btnDivContainer.setAttribute('class', 'px-3 pt-2 pb-3 text-center text-xs text-black/50 dark:text-white md:px-4 md:pt-3 md:pb-6');
    btnDivContainer.id = 'btn-btnDivContainer';

    bottomOptions.forEach((item) => {
      const button = document.createElement('button');
      button.style.border = '1px solid #d1d5db';
      button.style.borderRadius = '5px';
      button.style.padding = '0.5rem 1rem';
      button.style.margin = '0.5rem';
      button.innerText = item.text;
      button.addEventListener('click', () => {
        addTextToTextarea(item.template);
      });

      btnDivContainer.append(button);
    });

      if (versionDiv && versionDiv.textContent.includes('ChatGPT')) {
          // 如果已經加入了 btnDivContainer 元素，就不要重複加入
          if (versionDiv.contains(document.getElementById('btn-btnDivContainer'))) {
              return;
          }
          versionDiv.innerHTML = '';
          versionDiv.appendChild(btnDivContainer);
      } else {
          // 如果已經加入了 btnDivContainer 元素，就不要重複加入
          if (bottomDiv.contains(document.getElementById('btn-btnDivContainer'))) {
              return;
          }
          bottomDiv.appendChild(btnDivContainer);
          return;
      }
};

const addSideButton = () => {
  const textarea = document.querySelector("textarea");

  // 監聽 textarea 輸入
  textarea.addEventListener("keydown", e => {
    // 當輸入 "/" 時彈出選項
    if (e.key === "/" && e.target === textarea) {
      e.preventDefault(); // 防止出現 "/"
      showOptions();
    } else if (e.key === "Escape" && document.getElementById("optionsDiv")) {
      document.getElementById("optionsDiv").remove();
    }
  });

  // 隱藏選項框
  const hideOptions = () => {
    const optionsDiv = document.getElementById("optionsDiv");
    if (optionsDiv) {
      optionsDiv.parentNode.removeChild(optionsDiv);
    }
  };

  // 彈出選項
  const showOptions = () => {
    // 創建彈出框
    const optionsDiv = document.createElement("div");
    optionsDiv.id = "optionsDiv";
    optionsDiv.style.position = "absolute";
    optionsDiv.style.top = `${textarea.offsetTop - optionsDiv.offsetHeight}px`;
    optionsDiv.style.right = textarea.offsetLeft + "px";
    optionsDiv.style.backgroundColor = "rgba(52,53,65,var(--tw-bg-opacity))";
    optionsDiv.style.border = "1px solid rgb(209, 213, 219)";
    optionsDiv.style.borderRadius = "5px";
    optionsDiv.style.padding = "0.5rem 1rem";
    optionsDiv.style.margin = "0.5rem";
    optionsDiv.style.height = "169px"; // 設定預設高度
    optionsDiv.style.overflow = "auto";
    optionsDiv.style.maxHeight = "300px";
    optionsDiv.style.overflowY = "scroll";


    // 創建選項
    for (const {cmd} of commandOptions) {
      const optionDiv = document.createElement("div");
      optionDiv.classList.add('dark:bg-white/5');
      optionDiv.style.cursor = "pointer";
      optionDiv.style.margin = "0.5rem";
      optionDiv.style.padding = "0.5rem 1rem";
      optionDiv.style.border = "1px solid rgb(209, 213, 219)";
      optionDiv.style.borderRadius = "5px";
      optionDiv.style.backgroundColor = "hsla(0,0%,100%,.05)";
      optionDiv.style.color = "#fff";
      optionDiv.textContent = cmd;
      optionsDiv.appendChild(optionDiv);

      // 選項被選中
      optionDiv.addEventListener("click", () => {
        output(cmd);
        optionsDiv.remove();
      });

      // 選項被選中時反藍背景
      optionDiv.addEventListener("mouseenter", () => {
        optionDiv.style.backgroundColor = "#1f2937";
      });
      optionDiv.addEventListener("mouseleave", () => {
        optionDiv.style.backgroundColor = "hsla(0,0%,100%,.05)";
      });
    }

    // 將彈出框添加到文檔中
    document.body.appendChild(optionsDiv);

    // 選擇選項使用鍵盤上下鍵
    let selectedOptionIndex = 0;
    const selectOption = (index) => {
      const optionDivs = optionsDiv.querySelectorAll("div");
      if (index < 0) {
        index = optionDivs.length - 1;
      } else if (index >= optionDivs.length) {
        index = 0;
      }
      selectedOptionIndex = index;

      // 設定被選中的選項背景
      optionDivs.forEach((optionDiv) => {
        optionDiv.style.backgroundColor = "hsla(0,0%,100%,.05)";
      });
      optionDivs[selectedOptionIndex].style.backgroundColor = "#1f2937";
    };


    selectOption(selectedOptionIndex);

    textarea.addEventListener("keydown", (e) => {
      const optionDivs = optionsDiv.querySelectorAll("div");
      if (e.key === "ArrowUp") {
        selectOption(selectedOptionIndex - 1);
      } else if (e.key === "ArrowDown") {
        selectOption(selectedOptionIndex + 1);
      } else if (e.key === "Tab" && selectedOptionIndex >= 0) {
        const optionsDiv = document.getElementById("optionsDiv");
        if (optionsDiv) {
          output(optionDivs[selectedOptionIndex].textContent);
          hideOptions();
        }
      }
    });

    // 監聽點擊文檔，如果點擊其他地方則移除
    const removeOptions = () => {
      optionsDiv.remove();
      document.removeEventListener("click", removeOptions);
    };
    document.addEventListener("click", removeOptions);

    // 監聽鍵盤事件，透過上下鍵來選擇option
    let selectedIndex = 0;
    const optionDivs = optionsDiv.querySelectorAll("div");
    optionDivs[selectedIndex].classList.add("selected");
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp":
          if (optionDivs[selectedIndex].previousSibling) {
            optionDivs[selectedIndex].previousSibling.scrollIntoView();
          }
          selectedIndex = Math.max(selectedIndex - 1, 0);
          break;
        case "ArrowDown":
          if (optionDivs[selectedIndex].nextSibling) {
            optionDivs[selectedIndex].nextSibling.scrollIntoView();
          }
          selectedIndex = Math.min(selectedIndex + 1, optionDivs.length - 1);
          break;
        case "Tab":
          output(optionDivs[selectedIndex].textContent);
          selectedIndex = -1;
          e.preventDefault();
          break;
        case "Enter":
          output(optionDivs[selectedIndex].textContent);
          selectedIndex = -1;
          e.preventDefault();
          break;
        default:
          return;
      }
      // 選擇 option 後反藍背景
      optionDivs.forEach((optionDiv, index) => {
        if (index === selectedIndex) {
          optionDiv.classList.add("selected");
        } else {
          optionDiv.classList.remove("selected");
        }
      });
    });

    // 輸出選項對應的文字到 textarea 中
    const output = (cmd) => {
      const selectedOption = commandOptions.find((option) => option.cmd === cmd);
      if (!selectedOption || selectedOption === -1) {
        return;
      }
      const outputText = selectedOption.prompt;
      textarea.value = outputText;
      textarea.style.resize = "vertical";
      textarea.style.overflow = "auto";
      hideOptions();
      // 重置選項
      selectedOptionIndex = 0;
      selectOption(selectedOptionIndex);
    };
  };


}


(async function () {
  "use strict";

    // 紀錄當前網址
    var currentHref = location.href;

    // 定時器回調函數
    function checkHref() {
        // 如果網址發生變化
        if (location.href !== currentHref) {
            console.log('網址發生變化了');
            // 更新紀錄的網址
            currentHref = location.href;
            addSideButton();
            addAfterTextButtonsToSendDefaultMessage();
            addBottomButtonAndFormatting();
        }
    }

    // 每隔 1 秒檢查一次網址是否發生變化
    setInterval(checkHref, 1000);


  if (location.hostname === "chat.openai.com") {
    await autoFillFromSegment();
    // 偵測換頁必須 5 秒後才開始，因為第一次載入時可能會透過 ChatGPTAutoFill.user.js 加入預設表單內容
    setTimeout(async () => {
      addSideButton();
      addAfterTextButtonsToSendDefaultMessage();
      addBottomButtonAndFormatting();
    }, 3000);
  } else {
    await registerMenu();
  }


})();
