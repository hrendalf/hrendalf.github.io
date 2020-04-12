function randomIntBetween(min, max) { // inclusive
  return Math.floor(min + Math.random() * (max - min + 1));
}

function hideNumbers(text) {
    return text.replace(/[0-9]/g, "?")
}

function rollFirst(taskTarget, solveTarget) {
    rollExact(taskTarget, solveTarget, 1234, 567);
}

function roll(taskTarget, solveTarget) {
    var a = randomIntBetween(100, 2999);
    var b = randomIntBetween(10, 999);
    rollExact(taskTarget, solveTarget, a, b);
}

function rollExact(taskTarget, solveTarget, a, b) {
    var question = a + " x " + b + " = " + hideNumbers(""+ (a*b));
    var answer = a + " x " + b + " = " + (a*b);

    taskTarget.text(question);
    taskTarget.data("answer", answer);
}

function showMe(taskTarget, solveTarget) {
    taskTarget.text(taskTarget.data("answer"));
}