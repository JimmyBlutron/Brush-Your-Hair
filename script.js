let nav = 0;
let clicked = null;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleSelect = document.getElementById('eventTitleSelect');
const eventTimeInput = document.getElementById('eventTimeInput');
const eventDurationSelect = document.getElementById('eventDurationSelect'); // Added this line
const countdownElement = document.getElementById('countdownElement'); // Added this line

const weekdays= ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function openModal(date) {
  clicked = date;

  const eventForDay = events.find(event => event.date === clicked);

  if (eventForDay) {
    document.getElementById('eventTitle').innerText = eventForDay.title;
    document.getElementById('eventText').innerText = eventForDay.title; // Set event title in delete event modal

    // Calculate the end time of the event (within this scope)
    const endTime = new Date(eventForDay.endTime);
    const selectedDuration = (endTime - new Date(eventForDay.startTime)) / (60 * 1000);

    const countdownStartTime = new Date(endTime - selectedDuration * 60 * 1000);
    updateCountupInHeader(countdownStartTime, selectedDuration); // Update countdown in header
    deleteEventModal.style.display = 'block';

    // Update delete modal message
    if (countdownStartTime <= new Date()) {
      document.getElementById('deleteModalMessage').innerText = `${selectedDuration}m - Duration Reached`;
    } else {
      document.getElementById('deleteModalMessage').innerText = '';
    }
  } else {
    document.getElementById('eventTitle').innerText = ''; // Clear event title
    document.getElementById('countdown').innerText = ''; // Clear countdown

    // Show the newEventModal for creating a new event
    newEventModal.style.display = 'block';
    backDrop.style.display = 'block';
    eventTitleSelect.focus(); // Set focus on the eventTitleSelect field
  }
}

function renderCalendar() { 
  const dt = new Date();

  if (nav !== 0) {
    dt.setMonth(dt.getMonth() + nav);
  }

  const day = dt.getDate();
  const month = dt.getMonth(); //month starts at 0
  const year = dt.getFullYear();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dateString = firstDayOfMonth.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

  document.getElementById('monthDisplay').innerText = `${dt.toLocaleDateString('en-us', 
  { month: 'long'})} ${year}`;

  calendar.innerHTML = '';

  for(let i = 1; i <= paddingDays + daysInMonth; i++) {
  const daySquare = document.createElement('div');
  daySquare.classList.add('day');

  const dayString = `${month + 1}/${i - paddingDays}/${year}`

    if (i > paddingDays) {
      daySquare.innerText = innerText = i - paddingDays;
      const eventForDay = events.find(event => event.date === dayString);

      if (i - paddingDays === day && nav === 0) {
        daySquare.id = 'currentDay';
      }

      if (eventForDay) {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event');

        const eventTitle = document.createElement('h3');
        eventTitle.innerText = eventForDay.title;
        eventDiv.appendChild(eventTitle);

        const eventDuration = document.createElement('p');
        eventDuration.innerText = `${eventForDay.duration} minutes`;
        eventDiv.appendChild(eventDuration);

        daySquare.appendChild(eventDiv);
      }
      daySquare.addEventListener('click', (e) => openModal(dayString));
    } else {
      daySquare.classList.add('padding');
    }

    calendar.appendChild(daySquare);
  }
}

function closeModal() {
  eventTitleSelect.classList.remove('error');
  newEventModal.style.display = 'none';
  deleteEventModal.style.display = 'none';
  backDrop.style.display = 'none';
  eventTitleSelect = '';
  clicked = null;
  renderCalendar();
}

function saveEvent() {
  if (eventTitleSelect.value && eventTimeInput.value) {
    eventTitleSelect.classList.remove('error');

    // Get the selected duration from the dropdown
    const selectedDuration = parseInt(eventDurationSelect.value, 10);

    // Calculate start time based on the clicked date and user-specified time
    const [hours, minutes] = eventTimeInput.value.split(":");
    const clickedDate = new Date(clicked);
    const startTime = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), clickedDate.getDate(), hours, minutes);

    // Calculate end time based on selected duration
    const endTime = new Date(startTime.getTime() + selectedDuration * 60 * 1000);

    // Show the newEventModal for creating a new event
    newEventModal.style.display = 'none'; // Hide the modal
    backDrop.style.display = 'none'; // Hide the backdrop

    // Add the event to the events array
    events.push({
      date: clicked,
      title: eventTitleSelect.value,
      startTime: startTime,
      endTime: endTime,
      duration: selectedDuration
    });

    localStorage.setItem('events', JSON.stringify(events));

    // Calculate the time until the duration is reached
    renderCalendar(); // Render the calendar with the new event
    openModal(clicked);
    updateCountupInHeader(startTime, selectedDuration); // Start the countup timer
  } else {
    eventTitleSelect.classList.add('error');
  }
}





function deleteEvent() {
  events = events.filter(event => event.date!== clicked);
  localStorage.setItem('events', JSON.stringify(events));
  closeModal();

  if (eventTitle) {
    document.getElementById('eventText').innerText = ''; // Clear event title in delete event modal
  }

}

function initButtons(){
  document.getElementById('nextButton').addEventListener('click', () => {  
    nav++; 
    renderCalendar();
  });
  document.getElementById('backButton').addEventListener('click', () => {  
    nav--; 
    renderCalendar();
  });

  document.getElementById('saveButton').addEventListener('click', saveEvent); 

  document.getElementById('cancelButton').addEventListener('click',closeModal);

  document.getElementById('deleteButton').addEventListener('click', deleteEvent); 

  document.getElementById('closeButton').addEventListener('click',closeModal);
}

function updateCountupInHeader(startTime, duration) {
  const intervalId = setInterval(() => {
    const currentTime = new Date();
    const timeDifference = currentTime - startTime;

    if (timeDifference >= duration * 60 * 1000) {
      document.getElementById('countdown').innerText = 'Duration Reached';
      document.getElementById('deleteModalMessage').innerText = `${duration}m - Duration Reached`; // Set message in delete modal
      clearInterval(intervalId);
    } else if (timeDifference >= 0) {
        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        document.getElementById('countdown').innerText = `${minutes}m ${remainingSeconds}s`;
    } else {
      document.getElementById('countdown').innerText = '';
    }
  }, 1000); // Update every second
}



initButtons();
renderCalendar();