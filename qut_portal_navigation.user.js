// ==UserScript==
// @name         QUT Portal Navigation
// @description  New Floating Tour Button on QUT Portal Site
// @version      4.7.9
// @source       https://raw.githubusercontent.com/iewihc/GPTTranslateScript/main/qut_portal_navigation.user.js
// @namespace    https://github.com/iewihc/GPTTranslateScript/
// @updateURL    https://raw.githubusercontent.com/iewihc/GPTTranslateScript/main/qut_portal_navigation.user.js
// @downloadURL  https://raw.githubusercontent.com/iewihc/GPTTranslateScript/main/qut_portal_navigation.user.js
// @website      https://fullstackladder.dev/
// @author       Leon
// @run-at       document-end
// @license      MIT
// @match        https://claude.ai/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @match        https://qutvirtual4.qut.edu.au/group/student/home
// @match        https://connect.qut.edu.au
// @match        https://canvas.qut.edu.au
// @match        https://estudent.qut.edu.au/T1SMSAMSPRD/WebApps/eStudent/SM/StudyPlanDtls10.aspx?r=QUT.EST.STUDENT&f=QUT.EST.STUDYPLN.WEB
// @match        https://mytimetable.qut.edu.au/even/student
// @match        https://qutvirtual4.qut.edu.au/group/student/study/exams
// @match        https://qutvirtual4.qut.edu.au/group/student/enrolment
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const navigationItems = [
        { text: 'EMAIL', url: 'https://connect.qut.edu.au', emoji: '📧' },
        { text: 'CANVAS', url: 'https://canvas.qut.edu.au', emoji: '🎨' },
        { text: 'Study Plan', url: 'https://estudent.qut.edu.au/T1SMSAMSPRD/WebApps/eStudent/SM/StudyPlanDtls10.aspx?r=QUT.EST.STUDENT&f=QUT.EST.STUDYPLN.WEB', emoji: '📚' },
        { text: 'My Time Table', url: 'https://mytimetable.qut.edu.au/even/student', emoji: '📅' },
        { text: 'EXAM', url: 'https://qutvirtual4.qut.edu.au/group/student/study/exams', emoji: '📝' },
        { text: 'QUT PAY', url: 'https://qutvirtual4.qut.edu.au/group/student/enrolment', emoji: '💳' }
    ];

    function createButton(item) {
        const button = document.createElement('a');
        button.href = item.url;
        button.target = '_blank';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.padding = '0.5rem';
        button.style.margin = '0.5rem 0';
        button.style.backgroundColor = '#3b82f6';
        button.style.color = 'white';
        button.style.textDecoration = 'none';
        button.style.borderRadius = '5px';
        button.style.width = '100%';

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

        return button;
    }

    function createFloatingButton() {
        const floatingButton = document.createElement('div');
        floatingButton.setAttribute('id', 'qut-floating-button');
        floatingButton.style.position = 'fixed';
        floatingButton.style.bottom = '20px';
        floatingButton.style.right = '20px';
        floatingButton.style.zIndex = '9999';
        floatingButton.style.backgroundColor = 'rgba(31, 41, 55, 0.8)';
        floatingButton.style.borderRadius = '5px';
        floatingButton.style.padding = '10px';
        floatingButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        floatingButton.style.color = 'white';
        floatingButton.style.display = 'flex';
        floatingButton.style.flexDirection = 'column';
        floatingButton.style.alignItems = 'center';
        floatingButton.style.width = '200px';

        const toggleButton = document.createElement('button');
        toggleButton.innerHTML = '&#9776;'; // Hamburger icon
        toggleButton.style.border = 'none';
        toggleButton.style.background = 'none';
        toggleButton.style.color = 'white';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.fontSize = '24px';
        toggleButton.style.fontWeight = 'bold';
        toggleButton.style.marginBottom = '10px';

        const optionsContainer = document.createElement('div');
        optionsContainer.style.display = 'none';

        navigationItems.forEach(item => {
            const button = createButton(item);
            optionsContainer.appendChild(button);
        });

        toggleButton.addEventListener('click', () => {
            optionsContainer.style.display = optionsContainer.style.display === 'none' ? 'block' : 'none';
        });

        floatingButton.appendChild(toggleButton);
        floatingButton.appendChild(optionsContainer);
        document.body.appendChild(floatingButton);
    }

    createFloatingButton();
})();
