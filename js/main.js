"use strict";

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");
    var playgroundContainer = document.getElementById("playground-container");
    var navItems = document.getElementsByClassName("nav-item");
    var playgroundGrid = document.getElementById("playgroundGrid");
    var navbar = document.getElementById("navbar");
    var controlsMainContainer = document.getElementById("controls-main-container");
    var controlContainer = document.getElementById("control-container");
    var modal = document.getElementById("modal-number");
    var controlsPlay = document.getElementById("control-container-play");
    var controlsSolve = document.getElementById("control-container-solve");
    var modalNewSudoku = document.getElementById("modal-newSudoku");
    var newSudokuButton = document.getElementById("newSudoku-btn");
    var newSudokuEasy = document.getElementById("newSudoku-easy");
    var newSudokuMedium = document.getElementById("newSudoku-medium");
    var newSudokuHard = document.getElementById("newSudoku-hard");
    var solutionSudokuBtn = document.getElementById("solutionSudoku-btn");
    var solveSudokuBtn = document.getElementById("solveSudoku-btn");

    var innerWidth = window.innerWidth;
    var innerHeight = window.innerHeight;
    var inPlayState = false;

    var difficulty = {
        easy: 45,
        medium: 36,
        hard: 28
    };

    var playgroundController = {
        cellDimension: 60,
        gridDimension: 540,
        playgroundHeight: 600,
        canHover: true
    };

    var sudokuController = {
        isEditableGrid: [],
        numbersGrid: [],
        originalGrid: [],
        updateGridNumber: function updateGridNumber(number) {
            this.numbersGrid[this.clickedRow][this.clickedColumn] = number;
            writeSudokuToView(this.numbersGrid);
        },
        writeGridToView: function writeGridToView() {
            writeSudokuToView(this.numbersGrid);
        },

        clickedRow: 0,
        clickedColumn: 0
    };

    var modalNumberController = {
        numberStateArray: [true, true, true, true, true, true, true, true, true, true],
        getNumberState: function getNumberState(i) {
            return this.numberStateArray[i];
        }
    };

    // getting a top distance of the palyground
    function getPlaygroundTop() {
        return playgroundContainer.offsetTop;
    }
    // getting the height of the Controls Height Container
    function getControlsContainerHeight() {
        return controlsMainContainer.clientHeight;
    }

    // Load Play State of application
    function loadPlayState(dif, old) {
        playgroundContainer.style.display = "flex";
        controlsPlay.style.display = "flex";
        controlsSolve.style.display = "none";
        inPlayState = true;
        createSudokuGrid();

        // If a sudoku grid is stored in local storage, load it.
        if (localStorage.numbersGrid && localStorage.editableGrid && localStorage.originalGrid && old) {
            getGridsToLocalStorage();
        } else {
            // Creates a new sudoku.
            createMainPlaySudoku(dif);
        }
        sudokuController.writeGridToView();
    }

    // Load Solve State of application
    function loadSolveState() {
        playgroundContainer.style.display = "flex";
        controlsPlay.style.display = "none";
        controlsSolve.style.display = "flex";
        inPlayState = false;

        createSudokuGrid();
        createEmptySudokuToBeSolved();
        sudokuController.writeGridToView();
    }

    // Load Print State of application
    function loadPrintState() {
        controlsPlay.style.display = "none";
        controlsSolve.style.display = "none";
        playgroundContainer.style.display = "none";
    }

    // Writes numbers from the array to view 
    function writeSudokuToView(sudokuGrid) {
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                var cell = document.getElementById(i + "_" + j);
                if (sudokuGrid[i][j] > 0) {
                    cell.innerText = sudokuGrid[i][j];
                } else {
                    cell.innerText = "";
                }
            };
        };
    }

    function closeModal(elem) {
        elem.style.display = "none";
    }
    function openModal(elem) {
        elem.style.display = "flex";
    }

    function updateNumberModal(row, col, sudokuGrid) {
        var possibleRow = possibleFromRow(row, sudokuGrid);
        var possibleColumn = possibleFromColumn(col, sudokuGrid);
        var possibleSquare = possibleFromSquare(row, col, sudokuGrid);

        var num1 = intersectTwoArrays(possibleRow, possibleColumn);
        var possibleNumbers = intersectTwoArrays(num1, possibleSquare);

        for (var i = 1; i < 10; i++) {
            var modalNumElementView = document.getElementById("modalNumber_" + i);
            if (possibleNumbers.length > 0 && possibleNumbers.includes(i) || sudokuGrid[row][col] == i) {
                modalNumElementView.classList.remove("notClickableModalNumber");
                modalNumberController.numberStateArray[i] = true;
            } else {
                modalNumElementView.classList.add("notClickableModalNumber");
                modalNumberController.numberStateArray[i] = false;
            }
        }
    }

    function getGridsToLocalStorage() {
        if (localStorage.numbersGrid && localStorage.editableGrid && localStorage.originalGrid) {
            sudokuController.numbersGrid = JSON.parse(localStorage.getItem("numbersGrid"));
            sudokuController.isEditableGrid = JSON.parse(localStorage.getItem("editableGrid"));
            sudokuController.originalGrid = JSON.parse(localStorage.getItem("originalGrid"));
            updateEditableCellView(sudokuController.originalGrid);
        }
    }

    function setGridsToLocalStorage() {
        if (typeof localStorage !== "undefined") {
            localStorage.setItem("numbersGrid", JSON.stringify(sudokuController.numbersGrid));
            localStorage.setItem("editableGrid", JSON.stringify(sudokuController.isEditableGrid));
            localStorage.setItem("originalGrid", JSON.stringify(sudokuController.originalGrid));
        } else {
            Console.log("Sorry, I can not use your local storage, please allow it.");
        }
    }
    // Event to resize the playground, the grid and all grid cells + set the fontSize of the numbers in the view.
    var resizeControl = void 0;
    window.addEventListener("resize", function () {
        clearTimeout(resizeControl);
        resizeControl = setTimeout(function () {
            checkSudokuDimensions();
            setPlaygroundGridDimension(playgroundController.gridDimension, playgroundController.playgroundHeight);

            var viewSudokuCells = document.getElementsByClassName("sudokuCell");
            for (var i = 0; i < viewSudokuCells.length; i++) {
                setPlaygroundCellDimension(viewSudokuCells[i], playgroundController.cellDimension);
            }
        }, 200);
    });

    // Closes a modal, if the outer (dark) space is clicked
    modal.addEventListener("click", function (e) {
        if (e.target == modal) {
            closeModal(modal);
        }
    });

    // Click event for modal number

    var _loop = function _loop(i) {
        var modalNumberItem = document.getElementById("modalNumber_" + i);
        modalNumberItem.addEventListener("click", function () {
            if (modalNumberController.getNumberState(i)) {
                sudokuController.updateGridNumber(i);
                if (inPlayState) {
                    setGridsToLocalStorage();
                }
                closeModal(modal);
            }
        });
    };

    for (var i = 0; i < 10; i++) {
        _loop(i);
    }

    // If a new sudoku button is clicked, a modal with difficulty option will open.
    newSudokuButton.addEventListener("click", function () {
        openModal(modalNewSudoku);
    });
    // Closes the difficulty option modal, if the darker outer space is clicked.
    modalNewSudoku.addEventListener("click", function (e) {
        if (e.target == modalNewSudoku) {
            closeModal(modalNewSudoku);
        }
    });

    newSudokuEasy.addEventListener("click", function () {
        loadPlayState(difficulty.easy, false);
        closeModal(modalNewSudoku);
    });
    newSudokuMedium.addEventListener("click", function () {
        loadPlayState(difficulty.medium, false);
        closeModal(modalNewSudoku);
    });
    newSudokuHard.addEventListener("click", function () {
        loadPlayState(difficulty.hard, false);
        closeModal(modalNewSudoku);
    });

    solutionSudokuBtn.addEventListener("click", function () {
        solveSudoku(sudokuController.originalGrid);
        writeSudokuToView(sudokuController.originalGrid);
        sudokuController.numbersGrid = sudokuController.originalGrid;
    });

    solveSudokuBtn.addEventListener("click", function () {
        solveSudoku(sudokuController.numbersGrid);
        writeSudokuToView(sudokuController.numbersGrid);
    });
    // Adding an event listener for a Navigation Toggle

    var _loop2 = function _loop2(i) {
        if (navItems[i].classList.contains("active")) {
            loadPlayState(difficulty.easy, true);
        }
        // Adding an event listeners to a navigation item
        navItems[i].addEventListener("click", function () {
            if (!navItems[i].classList.contains("active")) {
                var active = document.getElementsByClassName("active")[0];
                active.classList.remove("active");
                navItems[i].classList.add("active");

                switch (navItems[i].id) {
                    case "navPlay":
                        loadPlayState(difficulty.easy, true);
                        break;
                    case "navSolve":
                        loadSolveState();
                        break;
                    case "navPrint":
                        loadPrintState();
                        break;
                }
            }
        });
    };

    for (var i = 0; i < navItems.length; i++) {
        _loop2(i);
    };

    // Creting a Sudoku grid with cells
    function createSudokuGrid() {
        // Clearing whole Sudoku grid
        clearSudokuGrid();
        // Checking and setting the grid dimensions
        checkSudokuDimensions();
        setPlaygroundGridDimension(playgroundController.gridDimension, playgroundController.playgroundHeight);
        // Creating sudoku's grid cells

        var _loop3 = function _loop3(i) {
            var _loop4 = function _loop4(j) {
                // Creating a div elemnt = the sudoku cell
                var gridCell = document.createElement("div");
                // Adding class to the created element
                gridCell.classList.add("sudokuCell");
                if (playgroundController.canHover) {
                    gridCell.classList.add("canHover");
                }
                setPlaygroundCellDimension(gridCell, playgroundController.cellDimension);
                // Checking if a background of the cell should be darker (in view);
                if (checkForSudokuDarkerCell(i, j)) {
                    gridCell.classList.add("darkerCellBg");
                }
                // Setting the ID to the element
                gridCell.id = i + "_" + j;
                // Appandeing the grid cell to the sudoku grid
                playgroundGrid.appendChild(gridCell);

                // EVENT LISTENER -> CLICK
                gridCell.addEventListener("click", function () {
                    sudokuController.clickedRow = i;
                    sudokuController.clickedColumn = j;

                    if (sudokuController.isEditableGrid[i][j]) {
                        updateNumberModal(i, j, sudokuController.numbersGrid);
                        openModal(modal);
                    }
                });
            };

            for (var j = 0; j < 9; j++) {
                _loop4(j);
            }
        };

        for (var i = 0; i < 9; i++) {
            _loop3(i);
        }
    }

    function clearSudokuGrid() {
        while (playgroundGrid.firstChild) {
            playgroundGrid.removeChild(playgroundGrid.firstChild);
        }
    }

    function checkForSudokuDarkerCell(i, j) {
        var result = false;
        if (i >= 0 && i < 3 || i > 5 && i < 9) {
            result = j >= 0 && j < 3 || j > 5 && j < 9 ? true : false;
        } else {
            result = j > 2 && j < 6 ? true : false;
        }
        return result;
    }

    function checkSudokuDimensions() {
        var dimensionSpace = 50;
        var playgroundMaxWidth = window.innerWidth - dimensionSpace;
        var playgroundMaxHeight = window.innerHeight - getPlaygroundTop() - getControlsContainerHeight() - 20;

        var minimum = Math.min(playgroundMaxWidth, playgroundMaxHeight);
        var cellDimension = Math.floor(minimum / 9);
        playgroundController.cellDimension = cellDimension;
        playgroundController.gridDimension = cellDimension * 9;
        playgroundController.playgroundHeight = playgroundMaxHeight;
    }

    function setPlaygroundGridDimension(width, height) {
        playgroundGrid.style.width = width + "px";
        playgroundContainer.style.width = width + "px";
        controlContainer.style.width = width + "px";
        playgroundContainer.style.height = height + "px";
    }
    function setPlaygroundCellDimension(element, dim) {
        element.style.width = dim + "px";
        element.style.height = dim + "px";
        if (dim < 25) {
            element.style.fontSize = 10 + "px";
        } else if (dim < 40) {
            element.style.fontSize = 20 + "px";
        } else if (dim < 50) {
            element.style.fontSize = 28 + "px";
        } else {
            element.style.fontSize = 40 + "px";
        }
    }

    // Create sudoku array
    function createMainPlaySudoku(difficulty) {
        // A filled array
        var solvedSudokuArray = helpFunctionForSudokuCreation();
        // A Play Array
        var sudoku = removeNumbersFromSudokuGrid(solvedSudokuArray, difficulty);
        var numbersSudoku = copyGrid(sudoku);
        sudokuController.originalGrid = copyGrid(sudoku);
        sudokuController.numbersGrid = numbersSudoku;
        sudokuController.isEditableGrid = isEditableSudokuGrid(sudoku);

        if (typeof localStorage !== "undefined") {
            localStorage.setItem("numbersGrid", JSON.stringify(sudokuController.numbersGrid));
            localStorage.setItem("editableGrid", JSON.stringify(sudokuController.isEditableGrid));
            localStorage.setItem("originalGrid", JSON.stringify(sudokuController.originalGrid));
        } else {
            Console.log("Sorry, I can not use your local storage, please allow it.");
        }

        updateEditableCellView(numbersSudoku);
    }
    function createEmptySudokuToBeSolved() {
        var isEditableGrid = [];
        var numberGrid = [];
        for (var i = 0; i < 9; i++) {
            isEditableGrid[i] = [];
            numberGrid[i] = [];
            for (var j = 0; j < 9; j++) {
                numberGrid[i][j] = 0;
                isEditableGrid[i][j] = true;
            }
        }
        sudokuController.numbersGrid = numberGrid;
        sudokuController.isEditableGrid = isEditableGrid;
        updateEditableCellView(numberGrid);
    }

    // Creates a filled sudoku grid.
    function helpFunctionForSudokuCreation() {
        var sudokuFilledArray = [];
        for (var i = 0; i < 9; i++) {
            sudokuFilledArray[i] = [];
            for (var j = 0; j < 9; j++) {
                sudokuFilledArray[i][j] = 0;
            };
        };
        // Fill diagonal squares
        // X00
        // 0X0
        // 00X
        for (var _i = 0; _i < 3; _i++) {
            putSquareToMainGrid(_i * 4, createBaseSquareArray(), sudokuFilledArray);
        }
        solveSudoku(sudokuFilledArray);
        return sudokuFilledArray;
    }

    // The function creates a 3x3 array wit numbers 1-9, the array is base for creating whole filled sudoku
    function createBaseSquareArray() {
        var array = new Array();
        var mainNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (var i = 0; i < 3; i++) {
            array[i] = new Array();
            for (var j = 0; j < 3; j++) {
                var arrayPosition = Math.floor(Math.random() * mainNumbers.length);
                var number = mainNumbers[arrayPosition];
                mainNumbers.splice(arrayPosition, 1);
                array[i][j] = number;
            }
        }
        return array;
    }

    // removes item from an array
    function removeFromArray(arr, num) {
        var index = arr.indexOf(num);
        if (index > -1) {
            arr.splice(index, 1);
        }
    }
    // Function intersets two array and return common values
    function intersectTwoArrays(array1, array2) {
        var helpArray1 = array1.slice(0);
        var helpArray2 = array2.slice(0);
        if (helpArray1 && helpArray2) {
            return helpArray1.filter(function (n) {
                return helpArray2.includes(n);
            });
        } else {
            return 0;
        }
    }

    // Function switches rows of 2D array
    function switchRows(squareArray, rowsToPushDown) {
        var helpArray = squareArray.slice();
        var newArray = squareArray.slice();
        for (var i = 0; i < rowsToPushDown; i++) {
            newArray[1] = helpArray[0];
            newArray[2] = helpArray[1];
            newArray[0] = helpArray[2];
            helpArray = newArray.slice();
        }
        return newArray;
    };
    // Function switches columns of 2D array
    function switchColumns(squareArray2, columnsToPushLeft) {
        var helpArray2 = [];
        var newArray2 = [];
        for (var k = 0; k < 3; k++) {
            helpArray2[k] = [];
            newArray2[k] = [];
        }
        for (var x = 0; x < 3; x++) {
            for (var y = 0; y < 3; y++) {
                helpArray2[x][y] = squareArray2[x][y];
                newArray2[x][y] = squareArray2[x][y];
            }
        }
        for (var i = 0; i < columnsToPushLeft; i++) {
            for (var j = 0; j < 3; j++) {
                newArray2[j][1] = helpArray2[j][0];
                newArray2[j][2] = helpArray2[j][1];
                newArray2[j][0] = helpArray2[j][2];
            }
            for (var _x = 0; _x < 3; _x++) {
                for (var _y = 0; _y < 3; _y++) {
                    helpArray2[_x][_y] = newArray2[_x][_y];
                }
            }
        }
        return newArray2;
    };

    // Fills main sudoku square wit values from a small square.
    function putSquareToMainGrid(squareNumber, squareArray, mainGrid) {
        var col = squareNumber % 3;
        var row = squareNumber > 6 ? 2 : squareNumber > 3 ? 1 : 0;
        for (var i = 0; i < squareArray.length; i++) {
            for (var j = 0; j < squareArray[i].length; j++) {
                mainGrid[3 * row + i][3 * col + j] = squareArray[i][j];
            }
        }
    }

    // Get possible numbers from the row
    function possibleFromRow(row, grid) {
        var array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (var i = 1; i < 10; i++) {
            if (grid[row].includes(i)) {
                removeFromArray(array, i);
            }
        }
        return array;
    }
    // Get possible numbers from the column
    function possibleFromColumn(column, grid) {
        var array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (var i = 0; i < 9; i++) {
            if (grid[i][column] > 0) {
                removeFromArray(array, grid[i][column]);
            }
        }
        return array;
    }
    // Get possible numbers from the square
    function possibleFromSquare(row, column, grid) {
        var array = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        var x = row - row % 3;
        var y = column - column % 3;
        for (var i = x; i < x + 3; i++) {
            for (var j = y; j < y + 3; j++) {
                if (grid[i][j] > 0) {
                    removeFromArray(array, grid[i][j]);
                }
            }
        }
        return array;
    }
    // Get possible numbers for all empty cells in a sudoku grid.
    function getPossibleNumbersArray(sudokuGrid) {
        var possibleNumbersArray = [];
        for (var i = 0; i < 9; i++) {
            possibleNumbersArray[i] = [];
            for (var j = 0; j < 9; j++) {
                if (sudokuGrid[i][j] == 0) {
                    var possibleRow = possibleFromRow(i, sudokuGrid);
                    var possibleColumn = possibleFromColumn(j, sudokuGrid);
                    var possibleSquare = possibleFromSquare(i, j, sudokuGrid);

                    var num1 = intersectTwoArrays(possibleRow, possibleColumn);
                    var possibleNumbers = intersectTwoArrays(num1, possibleSquare);
                    shuffleArray(possibleNumbers);

                    possibleNumbersArray[i][j] = possibleNumbers;
                } else {
                    possibleNumbersArray[i][j] = 0;
                }
            }
        }
        return possibleNumbersArray;
    }

    // Durstenfeld array shuffle algorithm.
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    // 3 functions checking, if the number is allowed to the position in a grid.
    function isAllowedRow(row, mainGrid, number) {
        return mainGrid[row].includes(number) ? false : true;
    }
    function isAllowedColumn(column, mainGrid, number) {
        for (var i = 0; i < mainGrid.length; i++) {
            if (mainGrid[i][column] == number) {
                return false;
            }
        }
        return true;
    }
    function isAllowedSquare(row, column, mainGrid, number) {
        var x = row - row % 3;
        var y = column - column % 3;
        for (var i = x; i < x + 3; i++) {
            for (var j = y; j < y + 3; j++) {
                if (mainGrid[i][j] == number) {
                    return false;
                }
            }
        }
        return true;
    }
    function numberIsAllowed(row, column, mainGrid, number) {
        if (isAllowedRow(row, mainGrid, number) && isAllowedColumn(column, mainGrid, number) && isAllowedSquare(row, column, mainGrid, number)) {
            return true;
        } else {
            return false;
        }
    }

    // Solve sudoku :)
    function solveSudoku(sudokuGrid) {
        var possibleNumbersArray = getPossibleNumbersArray(sudokuGrid);
        solveHelp(sudokuGrid, possibleNumbersArray);
    }
    // A recursion function to solve Sudoku
    function solveHelp(sudokuGrid, possibleNumbersArray) {
        for (var row = 0; row < 9; row++) {
            for (var col = 0; col < 9; col++) {
                if (sudokuGrid[row][col] == 0) {
                    var possibleNumbers = possibleNumbersArray[row][col];
                    for (var number = 0; number < possibleNumbers.length; number++) {
                        if (numberIsAllowed(row, col, sudokuGrid, possibleNumbers[number])) {
                            sudokuGrid[row][col] = possibleNumbers[number];
                            if (solveHelp(sudokuGrid, possibleNumbersArray)) {
                                return true;
                            } else {
                                sudokuGrid[row][col] = 0;
                            }
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    function removeNumbersFromSudokuGrid(filledSudokuGrid, difficulty) {
        var numbersToRemove = 81 - difficulty;
        var allNumbers = [];

        for (var i = 0; i < 81; i++) {
            allNumbers[i] = i;
        }

        for (var _i2 = 0; _i2 < numbersToRemove; _i2++) {
            var randomPosition = Math.floor(Math.random() * allNumbers.length);
            var number = allNumbers[randomPosition];
            allNumbers.splice(randomPosition, 1);

            var coordinates = getCoordinatesFromNumber(number);
            var row = coordinates[0];
            var col = coordinates[1];

            filledSudokuGrid[row][col] = 0;
        }
        return filledSudokuGrid;
    }
    function getCoordinatesFromNumber(num) {
        var row = Math.floor(num / 9);
        var column = num % 9;
        return [row, column];
    }

    function isEditableSudokuGrid(sudokuGrid) {
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (sudokuGrid[i][j] == 0) {
                    sudokuGrid[i][j] = true;
                } else {
                    sudokuGrid[i][j] = false;
                }
            }
        }
        return sudokuGrid;
    }

    function copyGrid(grid) {
        var newGrid = [];
        for (var i = 0; i < 9; i++) {
            newGrid[i] = [];
            for (var j = 0; j < 9; j++) {
                newGrid[i][j] = grid[i][j];
            }
        }
        return newGrid;
    }

    function updateEditableCellView(editGrid) {
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (editGrid[i][j] === null || editGrid[i][j] === 0) {
                    document.getElementById(i + "_" + j).classList.add("editableCell");
                } else {
                    document.getElementById(i + "_" + j).classList.remove("editableCell");
                }
            }
        }
    }
});