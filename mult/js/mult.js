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
    var b = randomIntBetween(100, 333);
    rollExact(taskTarget, solveTarget, a, b);
}

function rollExact(taskTarget, solveTarget, a, b) {
    var question = a + " x " + b + " = " + hideNumbers(""+ (a*b));
    var answer = a + " x " + b + " = " + (a*b);

    taskTarget.text(question);
    taskTarget.data("answer", answer);
    
    var solve = a + "\n";
    solve = solve + b + "\n";
    solve = solve + "--------" + "\n";
    
    var left = b;
    var space = "";
    var sum = 0;
    var m = 1;
    
    while (left > 0) { 
        var last = left % 10;
        left = (left - last) / 10;
    
        solve = solve + (a * last) + space + "\n";
        space = space + " ";
        
        sum = sum + (a * last * m);
        m = m * 10;
    }
    solve = solve + "--------" + "\n";
    solve = solve + sum;
    
    
    solveTarget.text(hideNumbers(solve));
    solveTarget.data("answer", solve);
}

function showMe(taskTarget, solveTarget) {
    taskTarget.text(taskTarget.data("answer"));
    solveTarget.text(solveTarget.data("answer"));
}