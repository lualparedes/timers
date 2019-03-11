/**
 * Represents a time value that has hours, minutes, and seconds. This class
 * provides useful methods to add/substract times like regular integers.
 */
class TimerCounterValue {

  constructor(rawValueInSeconds) {
    this.setTo(rawValueInSeconds);
  }

  get getRawValueInSeconds() {
    return this.rawValueInSeconds;
  }
  get getHours() {
    return this.hrs;
  }
  get getMinutes() {
    return this.min;
  }
  get getSeconds() {
    return this.sec;
  }

  setTo(rawValueInSeconds) {
    this.rawValueInSeconds = rawValueInSeconds;

    let secondsLeft = rawValueInSeconds;

    this.hrs = secondsLeft >= 3600 ? Math.floor(secondsLeft / 3600) : 0;
    secondsLeft = secondsLeft - (this.hrs * 3600);
    this.min = secondsLeft >= 60 ? Math.floor(secondsLeft / 60) : 0;
    secondsLeft = secondsLeft - (this.min * 60);
    this.sec = secondsLeft;
  }

  subtractSeconds(secondsToSubtract) {
    try {
      if (!(secondsToSubtract < 60 && secondsToSubtract >= 0)) {
        throw new Error('Wrong value for seconds');
      }
    }
    catch(e) {
      throw e;
    }

    if (this.sec >= secondsToSubtract) {
      this.rawValueInSeconds -= secondsToSubtract;
      this.sec -= secondsToSubtract;
    }

    else {

      if (this.rawValueInSeconds - secondsToSubtract <= 0) {
        this.rawValueInSeconds = 0;
        this.hrs = 0;
        this.min = 0;
        this.sec = 0;
      }
      else {
        this.setTo(this.rawValueInSeconds - secondsToSubtract);
      }
    }
  }
}

/**
 * Represents a timer
 */
class Timer {

  constructor(timerId, hrs, min, sec) {
    this._id = timerId;
    this.elemId = `timer-${timerId}`;
    this.elem = document.getElementById(this.elemId);
    this.isRunning = false;
    this.title = `Timer ${+timerId}`;
    this.initialTotalSeconds = hrs*3600 + min*60 + sec;
    this.counterVal = new TimerCounterValue(this.initialTotalSeconds);
    this.interval = null;

    this.elem.querySelector('.btn--main').addEventListener(
      'click',
      this.startToggle.bind(this)
    );
    this.elem.querySelector('.btn--phantom').addEventListener(
      'click',
      this.reset.bind(this)
    );
  }

  start() {
    this.elem.querySelector('.btn--main').innerHTML = 'Pause';
    this.interval = setInterval(() => {
      this.updateCounter();
    }, 1000);
  }

  pause() {
    this.elem.querySelector('.btn--main').innerHTML = 'Start';
    clearInterval(this.interval);
  }

  startToggle() {
    if (this.isRunning) {
      this.pause();
    }
    else {
      this.start();
    }
    this.isRunning = !this.isRunning;
  }

  timeIsUp() {
    if (this.counterVal.getRawValueInSeconds === 0) {
      return true;
    }
    return false;
  }

  alertTimeIsUp() {
    window.alert(`${this.title} has finished!`);
  }

  updateCounter() {
    if (this.timeIsUp()) {
      this.alertTimeIsUp();
      clearInterval(this.interval);
    }
    else {
      this.counterVal.subtractSeconds(1);
      console.log(this.counterVal.getRawValueInSeconds);
    }
  }

  reset() {
    this.startToggle();
    this.counterVal.setTo(this.initialTotalSeconds);
  }
}

function TimerCounterValueTest() {
  console.log('Testing TimerCounterValue...');
  const counterVal = new TimerCounterValue(3661);

  console.log('\tconstrtuctor works');
  console.assert(counterVal.getHours === 1);
  console.assert(counterVal.getMinutes === 1);
  console.assert(counterVal.getSeconds === 1);

  console.log('\tsubtractSeconds works');
  counterVal.subtractSeconds(2);
  console.assert(counterVal.getHours === 1);
  console.assert(counterVal.getMinutes === 0);
  console.assert(counterVal.getSeconds === 59);
}

(function () {
  const timer = new Timer('000', 0, 0, 0);

  TimerCounterValueTest();
}())