'use strict';
/**
 * Library with useful methods of general application.
 */
const Utilities = {
  
  /**
   * Adds left zeroes as padding to return a string of exactly n characters.
   *
   * @note {1} An array was used to avoid wasting memory.
   */
  fillDecimalPlaces: (str, n) => {
    const paddingNeed = n - str.length;
    const paddedStrArr = []; // {1}

    if (paddingNeed > 0) {
      for (let i = 0; i < paddingNeed; i++) {
        paddedStrArr.push('0');
      }
      paddedStrArr.push(str);
      return paddedStrArr.join('');
    }

    return str;
  },

  /**
   * Expands a class using a mixin.
   *
   * @param supplier - Mixin object.
   * @param receiver - Class that will be expanded.
   */
  addMixin: (supplier, receiver) => {
    for (let key in supplier) {
      if (supplier.hasOwnProperty(key)) {
        receiver.prototype[key] = supplier[key];
      }
    }
  }, 
}

/**
 * Expands a class to behave as a <em>Subject</em> in the <em>Observer</em>
 * pattern.
 */
const SubjectMixin = {
  attach: function (observer) {
    this.observers = this.observers || [];
    this.observers.push(observer);
  },
  dettach: function (observer) {
    this.observers = this.observers || [];
    this.observers.splice(this.observers.indexOf(observer));
  },
  notify: function () {
    this.observers = this.observers || [];
    this.observers.forEach((observer) => {
      observer.update();
    });
  }
}

/**
 * A wrapper around an InputHTMLElement that allows it to behave as an
 * <em>Observer</em>.
 */
class ObserverInputElement {

  constructor(inputElem, subject, callback) {
    this.subject = subject;
    this.elem = inputElem;
    this.updater = callback;
  }

  update() {
    this.updater();
  }
}

/**
 * Represents a time value that has hours, minutes, and seconds. This class
 * provides useful methods to add/substract times like regular integers and also
 * works as a <em>Subject</em> in the <em>Observer</em> pattern using a mixin.
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
Utilities.addMixin(SubjectMixin, TimerCounterValue);

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
    this.hrsElem = new ObserverInputElement(
      this.elem.querySelector(`#hrs-${this._id}`),
      this.counterVal,
      function () {
        this.elem.value = Utilities.fillDecimalPlaces(
          this.subject.getHours.toString(),
          2
        );
      }
    );
    this.minElem = new ObserverInputElement(
      this.elem.querySelector(`#min-${this._id}`),
      this.counterVal,
      function () {
        this.elem.value = Utilities.fillDecimalPlaces(
          this.subject.getMinutes.toString(),
          2
        );
      }
    );
    this.secElem = new ObserverInputElement(
      this.elem.querySelector(`#sec-${this._id}`),
      this.counterVal,
      function () {
        this.elem.value = Utilities.fillDecimalPlaces(
          this.subject.getSeconds.toString(),
          2
        );
      }
    );
    this.interval = null;

    // Click events for buttons
    this.elem.querySelector('.btn--main').addEventListener(
      'click',
      this.startToggle.bind(this)
    );
    this.elem.querySelector('.btn--phantom').addEventListener(
      'click',
      this.reset.bind(this)
    );

    // Attach observers
    this.counterVal.attach(this.hrsElem);
    this.counterVal.attach(this.minElem);
    this.counterVal.attach(this.secElem);

    // ======== RANDOM STUFF ========
    this.elem.querySelector('#sec-000').addEventListener(
      'keyup',
      this.updateInputUI.bind(this)
    );
  }

  // ======== RANDOM STUFF ========
  isValid(key) {
    let valid = false;
    const VALID_KEYS = [
      'Backspace',
      'ArrowRight',
      'ArrowLeft',
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9'
    ];
    VALID_KEYS.forEach((validKey) => {
      if (key === validKey) {
        valid = true;
      }
    });
    return valid;
  }

  // ======== RANDOM STUFF ========
  updateInputUI(e) {
    const inputEl = e.target;
    if (!this.isValid(e.key)) {
      inputEl.value = Utilities.fillDecimalPlaces(
        this.counterVal.getSeconds.toString(),
        2
      );
    }
    if (inputEl.value.length > 2) {
      inputEl.value = inputEl.value.slice(1);
    }
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
      this.counterVal.notify();
    }
  }

  reset() {
    this.startToggle();
    this.counterVal.setTo(this.initialTotalSeconds);
    this.counterVal.notify();
  }
}

function UtilitiesTest() {
  console.log('Testing Utilities...');

  console.log('\tfillDecimalPlaces works');
  console.assert(Utilities.fillDecimalPlaces('1', 2) === '01');
  console.assert(Utilities.fillDecimalPlaces('11', 2) === '11');
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

function Test() {
  UtilitiesTest();
  TimerCounterValueTest();
}

(function () {

  const timer = new Timer('000', 0, 1, 5);

  //Test();
}())