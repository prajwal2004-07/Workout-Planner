let workouts = JSON.parse(localStorage.getItem('workouts')) || {};
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const muscleGroups = ["Rest", "Chest", "Back", "Biceps", "Triceps", "Shoulders", "Legs"];
const today = new Date().getDay();
let hot; // Handsontable instance

// Display the current day and muscle group
document.getElementById('day-header').textContent = `${days[today]} - ${muscleGroups[today]}`;

// Save workout data and update local storage
document.getElementById('save-button').addEventListener('click', () => {
    const workoutName = document.getElementById('workout-name').value;
    const weight = document.getElementById('weight').value;
    const sets = document.getElementById('sets').value;
    const reps = document.getElementById('reps').value;

    if (workoutName && weight && sets && reps) {
        const workout = {
            time: new Date().toLocaleTimeString(),
            workoutName,
            weight: parseFloat(weight),
            sets: parseInt(sets),
            reps: parseInt(reps)
        };

        const currentDate = new Date().toLocaleDateString();
        if (!workouts[currentDate]) {
            workouts[currentDate] = [];
        }
        workouts[currentDate].push(workout);
        saveWorkouts();
        updateWorkoutList();
        updateSpreadsheet();
        clearForm();
        alert('Workout Saved!');
    } else {
        alert('Please fill in all the fields before saving.');
    }
});

// Clear the form
function clearForm() {
    document.getElementById('workout-name').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('sets').value = '';
    document.getElementById('reps').value = '';
}

// Update the workout list
function updateWorkoutList() {
    const workoutList = document.getElementById('workout-list');
    workoutList.innerHTML = '';
    
    Object.entries(workouts).sort((a, b) => new Date(b[0]) - new Date(a[0])).forEach(([date, dayWorkouts]) => {
        const dateHeader = document.createElement('h3');
        dateHeader.textContent = date;
        workoutList.appendChild(dateHeader);

        dayWorkouts.forEach(workout => {
            const workoutItem = document.createElement('div');
            workoutItem.classList.add('workout-item');
            workoutItem.innerHTML = `
                <p><strong>${workout.workoutName}</strong> - ${workout.time}</p>
                <p>Weight: ${workout.weight}kg, Sets: ${workout.sets}, Reps: ${workout.reps}</p>
            `;
            workoutList.appendChild(workoutItem);
        });
    });
}

// Save workouts to local storage
function saveWorkouts() {
    localStorage.setItem('workouts', JSON.stringify(workouts));
}

// Initialize spreadsheet
function initSpreadsheet() {
    const container = document.getElementById('spreadsheet-container');
    hot = new Handsontable(container, {
        data: [],
        colHeaders: ['Date', 'Time', 'Workout Name', 'Weight (kg)', 'Sets', 'Reps'],
        columns: [
            { data: 'date' },
            { data: 'time' },
            { data: 'workoutName' },
            { data: 'weight', type: 'numeric' },
            { data: 'sets', type: 'numeric' },
            { data: 'reps', type: 'numeric' }
        ],
        licenseKey: 'non-commercial-and-evaluation'
    });
}

// Update spreadsheet data
function updateSpreadsheet() {
    if (!hot) {
        initSpreadsheet();
    }
    const flatWorkouts = getFlatWorkouts();
    hot.loadData(flatWorkouts);
}

// Get flattened workout data
function getFlatWorkouts() {
    const flatWorkouts = [];
    Object.entries(workouts).forEach(([date, dayWorkouts]) => {
        dayWorkouts.forEach(workout => {
            flatWorkouts.push({
                date,
                time: workout.time,
                workoutName: workout.workoutName,
                weight: workout.weight,
                sets: workout.sets,
                reps: workout.reps
            });
        });
    });
    return flatWorkouts;
}

// Toggle between list view and spreadsheet view
document.getElementById('toggle-view-button').addEventListener('click', () => {
    const workoutList = document.getElementById('workout-list');
    const spreadsheetContainer = document.getElementById('spreadsheet-container');
    if (workoutList.style.display !== 'none') {
        workoutList.style.display = 'none';
        spreadsheetContainer.style.display = 'block';
        updateSpreadsheet();
    } else {
        workoutList.style.display = 'block';
        spreadsheetContainer.style.display = 'none';
    }
});

// Export to Excel
document.getElementById('export-button').addEventListener('click', () => {
    const flatWorkouts = getFlatWorkouts();
    const worksheet = XLSX.utils.json_to_sheet(flatWorkouts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Workouts");
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Save the file
    saveAsExcelFile(excelBuffer, 'Workout_Planner.xlsx');
});

// Function to save Excel file
function saveAsExcelFile(buffer, fileName) {
    const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // For IE
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(data, fileName);
        return;
    }
    
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = fileName;
    link.click();
    setTimeout(() => {
        // For Firefox
        window.URL.revokeObjectURL(link.href);
    }, 100);
}

// Initialize the workout list and spreadsheet
updateWorkoutList();
initSpreadsheet();
updateSpreadsheet();