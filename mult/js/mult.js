function randomIntBetween(min, max) { // inclusive
  return Math.floor(min + Math.random() * (max - min + 1));
}

function roll(taskTarget, solveTarget) {
    var a = randomIntBetween(100, 2999);
    var b = randomIntBetween(10, 999);

    taskTarget.text(a + " x " + b);
    taskTarget.data("result", a + " x " + b + " = " + (a*b));
}

function showMe(taskTarget, solveTarget) {
    taskTarget.text(taskTarget.data("result"));   
}