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

const weeklyRoomSchedule = {
    الأحد: {
        'أحمد بن حنبل': [['تجويد - أم عبدالله', '17:30 - 19:00']],
        'البخاري': [['تربوي - غادة', '17:00']],
        'مالك': [['قاعدة نورانية - مروة', '16:00']],
        'أبو حنيفة': [['قاعدة نورانية - نجمة', '15:30']],
        'القاعة': [
            ['تربوي - أثير', '15:30 - 16:30'],
            ['تربوي - نهاية', '17:00'],
            ['تربوي - جودات', 'بعد المغرب وبعد العشاء']
        ],
        'السدة': [['تربوي - الشيخ هلال', 'بعد العشاء']],
        'المسجد القديم': [
            ['تربوي - أميرة', '16:00 - 17:00'],
            ['تربوي - محمد نبيل', '18:00'],
            ['قاعدة نورانية - فاطمة', '15:00 - 16:00']
        ]
    },
    الاثنين: {
        'البخاري': [['تربوي - وئام', 'بعد العصر']],
        'مالك': [['تربوي - آلاء', '15:30 - 16:30']],
        'القاعة': [['مدارس العلوم الشرعية', '18:50 - 20:00']]
    },
    الثلاثاء: {
        'البخاري': [['تربوي - نسيبة', '16:00 - 17:00']],
        'مالك': [['قاعدة نورانية - مروة', '16:00']],
        'أبو حنيفة': [
            ['قاعدة نورانية - رابية', '17:00'],
            ['تربوي - نجمة', '16:30 - 18:00']
        ],
        'المسجد القديم': [
            ['قاعدة وتربوي - فاطمة', '15:00 - 17:00'],
            ['تربوي - محمد نعيم', '17:15'],
            ['تربوي - محمد نبيل', '18:30']
        ]
    },
    الأربعاء: {
        'أحمد بن حنبل': [['تلاوة - أحلام', '17:30']],
        'الشافعي': [['تربوي - إسراء', '16:30 - 18:00']],
        'البخاري': [['تربوي - لمياء', '15:30 - 16:45']],
        'مالك': [['تربوي - أحلام', '16:00 - 17:00']],
        'أبو حنيفة': [
            ['تربوي - هيا', '15:00 - 16:00'],
            ['قاعدة نورانية - نجمة', '16:00 - 17:00']
        ],
        'القاعة': [
            ['تربوي - نهاية', '16:30 - 18:00'],
            ['تربوي - أنس', 'بعد العشاء']
        ],
        'المسجد القديم': [
            ['تربوي - هبة أبو الهيجاء', '16:00 - 17:15'],
            ['تربوي - محمد نعيم', '17:30']
        ]
    },
    الخميس: {
        'الشافعي': [['تربوي - أزهار', '18:00 - 19:30']],
        'مالك': [
            ['معهد أخوات', '16:00 - 18:00'],
            ['تربوي أخوات', '18:00 - 19:30']
        ],
        'أبو حنيفة': [['تربوي - سما', '15:30 - 16:30']],
        'القاعة': [
            ['معهد أخوات', '16:00 - 18:00'],
            ['تربوي أخوات', '17:00 - 18:30']
        ],
        'السدة': [['تربوي - الشيخ هلال', 'بعد العشاء']],
        'المسجد القديم': [
            ['تربوي - زهراء', '16:00 - 17:00'],
            ['تربوي - أسماء', '17:30 - 19:00']
        ]
    },
    الجمعة: {
        'مسلم': [['تربوي - يزن', '10:00']],
        'مالك': [['تربوي - نبيل', '16:00 - 19:00']],
        'أبو حنيفة': [
            ['فتيان', '15:00 - 16:30'],
            ['تربوي - وئام ومحمد', 'بعد العصر']
        ],
        'المسجد القديم': [
            ['تربوي - عبادة', '09:00'],
            ['تربوي - يزن', '10:00'],
            ['تربوي - أسماء', '11:00 - 12:30'],
            ['تربوي - أسماء', '16:00 - 18:30']
        ]
    },
    السبت: {
        'أحمد بن حنبل': [['تربوي - أحلام', '10:30 - 12:00']],
        'مسلم': [['تربوي - محمد صفوت', '10:00']],
        'البخاري': [['تجويد', '08:30 - 11:30']],
        'مالك': [
            ['تربوي - أنس', '09:30'],
            ['تربوي - هيا', '11:45'],
            ['تربوي - نبيل', '16:30 - 19:30'],
            ['تربوي - يزن', 'بعد العصر'],
            ['تربوي - نبيل', 'بعد المغرب']
        ],
        'أبو حنيفة': [['قاعدة نورانية - رابية', '09:00']],
        'القاعة': [['تربوي - سندس', '10:00']],
        'المسجد القديم': [
            ['تربوي - حنان', '15:15 - 17:00'],
            ['تربوي - عبادة', 'بعد المغرب']
        ]
    }
};

function getActivityStartTime(time) {
    const clockTime = time.match(/(\d{1,2})(?::(\d{2}))?/);
    if (clockTime) {
        return Number(clockTime[1]) * 60 + Number(clockTime[2] || 0);
    }

    if (time.includes('الفجر')) return 5 * 60;
    if (time.includes('العصر')) return 16 * 60;
    if (time.includes('المغرب')) return 18 * 60;
    if (time.includes('العشاء')) return 20 * 60;
    return Number.POSITIVE_INFINITY;
}

function createRoomScheduleCard(roomName, activities = []) {
    const card = document.createElement('article');
    card.className = activities.length ? 'room-schedule' : 'room-schedule room-schedule-empty';

    const heading = document.createElement('h3');
    heading.textContent = roomName;
    card.appendChild(heading);

    if (activities.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'لا يوجد برنامج اليوم';
        card.appendChild(emptyMessage);
        return card;
    }

    const activityList = document.createElement('ul');
    const orderedActivities = activities
        .map((activity, index) => ({ activity, index }))
        .sort((first, second) => (
            getActivityStartTime(first.activity[1]) - getActivityStartTime(second.activity[1])
            || first.index - second.index
        ));

    orderedActivities.forEach(({ activity: [activityName, time] }) => {
        const listItem = document.createElement('li');
        const activityLabel = document.createElement('span');
        activityLabel.textContent = activityName;

        const separator = document.createElement('span');
        separator.className = 'room-schedule-separator';
        separator.setAttribute('aria-hidden', 'true');
        separator.textContent = '|';

        const timeLabel = document.createElement('bdi');
        timeLabel.dir = 'ltr';
        timeLabel.textContent = time;
        listItem.append(activityLabel, separator, timeLabel);
        activityList.appendChild(listItem);
    });

    card.appendChild(activityList);
    return card;
}

document.querySelectorAll('.rooms-day').forEach((day) => {
    const dayName = day.querySelector('summary').textContent.trim();
    const daySchedule = weeklyRoomSchedule[dayName] || {};
    const dayGrid = day.querySelector('.rooms-day-grid');

    dayGrid.replaceChildren(...weeklyRoomNames.map((roomName) => (
        createRoomScheduleCard(roomName, daySchedule[roomName] || [])
    )));
});
