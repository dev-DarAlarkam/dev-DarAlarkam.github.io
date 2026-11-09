const weeklyRoomNames = [
    'أحمد بن حنبل',
    'الشافعي',
    'مسلم',
    'البخاري',
    'مالك',
    'أبو حنيفة',
    'القاعة',
    'السدة',
    'المسجد القديم'
];

const weeklyRoomDays = document.querySelectorAll('.rooms-day-grid');

weeklyRoomDays.forEach((dayGrid) => {
    const roomCards = new Map();

    dayGrid.querySelectorAll('.room-schedule').forEach((card) => {
        const heading = card.querySelector('h3');
        const roomName = heading.textContent.trim();

        if (roomName === 'غرف مالك والبخاري ومسلم') {
            weeklyRoomNames.slice(2, 5).forEach((sharedRoomName) => {
                const sharedCard = card.cloneNode(true);
                sharedCard.querySelector('h3').textContent = sharedRoomName;
                sharedCard.classList.add('room-schedule-shared');
                roomCards.set(sharedRoomName, sharedCard);
            });
            return;
        }

        roomCards.set(roomName, card);
    });

    weeklyRoomNames.forEach((roomName) => {
        if (!roomCards.has(roomName)) {
            const emptyCard = document.createElement('article');
            emptyCard.className = 'room-schedule room-schedule-empty';
            const heading = document.createElement('h3');
            heading.textContent = roomName;
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'لا يوجد برنامج اليوم';
            emptyCard.append(heading, emptyMessage);
            roomCards.set(roomName, emptyCard);
        }
    });

    dayGrid.replaceChildren(...weeklyRoomNames.map((roomName) => roomCards.get(roomName)));
});
