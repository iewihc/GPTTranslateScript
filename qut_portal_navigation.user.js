// ==UserScript==
// @name         QUT Portal Navigation
// @description  New Floating Tour Button on QUT Portal Site
// @version      1.2.0
// @source       https://raw.githubusercontent.com/iewihc/GPTTranslateScript/main/qut_portal_navigation.user.js
// @namespace    https://github.com/iewihc/GPTTranslateScript/
// @updateURL    https://raw.githubusercontent.com/iewihc/GPTTranslateScript/main/qut_portal_navigation.user.js
// @downloadURL  https://raw.githubusercontent.com/iewihc/GPTTranslateScript/main/qut_portal_navigation.user.js
// @website      https://fullstackladder.dev/
// @author       Leon
// @run-at       document-end
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @match        https://connect.qut.edu.au/*
// @match        https://canvas.qut.edu.au/*
// @match        https://estudent.qut.edu.au/*
// @match        https://mytimetable.qut.edu.au/*
// @match        https://qutvirtual4.qut.edu.au/*
// @match        https://outlook.office.com/mail/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const navigationItems = [
        { text: 'Email', url: 'https://connect.qut.edu.au', emoji: '📧' },
        { text: 'Canvas', url: 'https://canvas.qut.edu.au', emoji: '🎨' },
        { text: 'Study Plan', url: 'https://estudent.qut.edu.au/T1SMSAMSPRD/WebApps/eStudent/SM/StudyPlanDtls10.aspx?r=QUT.EST.STUDENT&f=QUT.EST.STUDYPLN.WEB', emoji: '📚' },
        { text: 'My Time Table', url: 'https://mytimetable.qut.edu.au/even/student', emoji: '📅' },
        { text: 'Exam', url: 'https://qutvirtual4.qut.edu.au/group/student/study/exams', emoji: '📝' },
        { text: 'Qut Pay', url: 'https://qutvirtual4.qut.edu.au/group/student/enrolment', emoji: '💳' }
    ];

    function createButton(item) {
        const button = document.createElement('a');
        button.href = item.url;
        button.target = '_blank';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.padding = '1rem';
        button.style.margin = '0.5rem';
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        button.style.color = 'white';
        button.style.textDecoration = 'none';
        button.style.borderRadius = '5px';
        button.style.width = '100%';
        button.style.transition = 'background-color 0.3s';

        const emoji = document.createElement('span');
        emoji.innerText = item.emoji;
        emoji.style.marginRight = '0.5rem';
        button.appendChild(emoji);

        const text = document.createElement('span');
        text.innerText = item.text;
        text.style.whiteSpace = 'nowrap';
        text.style.overflow = 'hidden';
        text.style.textOverflow = 'ellipsis';
        button.appendChild(text);

        button.addEventListener('mouseover', () => {
            button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });

        button.addEventListener('mouseout', () => {
            button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });

        return button;
    }

    function createFloatingButton() {
        const floatingButton = document.createElement('div');
        floatingButton.setAttribute('id', 'qut-floating-button');
        floatingButton.style.position = 'fixed';
        floatingButton.style.bottom = '0';
        floatingButton.style.right = '0';
        floatingButton.style.zIndex = '9999';
        floatingButton.style.backgroundColor = 'rgba(30, 64, 175, 0.9)';
        floatingButton.style.borderRadius = '10px 0 0 0';
        floatingButton.style.padding = '10px';
        floatingButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)';
        floatingButton.style.color = 'white';
        floatingButton.style.display = 'flex';
        floatingButton.style.flexDirection = 'column';
        floatingButton.style.alignItems = 'flex-start';
        floatingButton.style.width = '250px';
        floatingButton.style.transition = 'transform 0.3s';

        const toggleButton = document.createElement('button');
        toggleButton.innerHTML = '&#9776; QUT Links'; // Hamburger icon and text
        toggleButton.style.border = 'none';
        toggleButton.style.background = 'none';
        toggleButton.style.color = 'white';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.fontSize = '18px';
        toggleButton.style.fontWeight = 'bold';
        toggleButton.style.marginBottom = '10px';
        toggleButton.style.transition = 'transform 0.3s';

        const optionsContainer = document.createElement('div');
        optionsContainer.style.display = 'none';
        optionsContainer.style.width = '100%';

        navigationItems.forEach(item => {
            const button = createButton(item);
            optionsContainer.appendChild(button);
        });

        let isOpen = false;

        toggleButton.addEventListener('click', () => {
            isOpen = !isOpen;
            optionsContainer.style.display = isOpen ? 'block' : 'none';
            floatingButton.style.width = isOpen ? '250px' : '150px';
        });

        floatingButton.addEventListener('mouseover', () => {
            if (!isOpen) {
                floatingButton.style.transform = 'translateX(-10px)';
            }
        });

        floatingButton.addEventListener('mouseout', () => {
            if (!isOpen) {
                floatingButton.style.transform = 'translateX(0)';
            }
        });

        floatingButton.appendChild(toggleButton);
        floatingButton.appendChild(optionsContainer);
        document.body.appendChild(floatingButton);
    }

    createFloatingButton();
})();
