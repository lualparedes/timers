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
const SubjectPropMixin = {
  attach: function (observer) {
    this.observerElements = this.observerElements || [];
    this.observerElements.push(observer);
  },
  dettach: function (observer) {
    this.observerElements = this.observerElements || [];
    this.observerElements.slice(this.observerElements.indexOf(observer));
  },
  notify: function () {
    this.observerElements = this.observerElements || [];
    this.observerElements.forEach((observer) => {
      observer.updateAsObserver();
    });
  },
  /**
   * @param {customGetter} Optional function with the following signature:
   *        (thisSubject): any. It is used to define a special getter for a type
   *        with complex state.
   */
  getState: function (customGetter) {
    if (customGetter) {
      return customGetter(this);
    }
    return this.subjectState;
  },
  /**
   * @param {newState} Any
   * @param {customSetter} Optional function with the following signature:
   *        (thisSubject, newState): void. It is used to define a special setter
   *        for a type with complex state.
   */
  setState: function (newState, customSetter) {
    if (customSetter) {
      customSetter(this, newState);
    }
    else {
      this.subjectState = newState;
    }
  }
}

/**
 * A wrapper around an object property that allows it to behave as a
 * <em>Subject</em>.
 */
class SubjectProp {

  constructor(initialState) {
    this.subjectState = initialState;
    this.observerElements = [];
  }
}
Utilities.addMixin(SubjectPropMixin, SubjectProp);

/**
 * A wrapper around an HTMLElement that allows it to behave as an
 * <em>Observer</em>.
 */
class ObserverElem {

  constructor(elem, subjectProp, updaterAsObserver, dualBinding, customSetter) {
    this.elem = elem;
    this.subjectProp = subjectProp;
    this.updater = updaterAsObserver;

    if (dualBinding) {
      this.elem.addEventListener(
        'keyup',
        this.updateAsSubject.bind(this, customSetter)
      );
    }
  }

  updateAsObserver() {
    this.updater(this);
  }

  /**
   * @param {customSetter} Optional function with signature (newState): void. It
   *        is used to substitute the default setState in subjectProp.
   */
  updateAsSubject(customSetter) {
    this.subjectProp.setState(this.elem.value, customSetter);
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

  setHours(newHrs) {
    const diff = newHrs*3600 - this.hrs*3600;
    this.setTo(this.rawValueInSeconds + diff);
  }

  setMinutes(newMin) {
    const diff = newMin*60 - this.min*60;
    this.setTo(this.rawValueInSeconds + diff);
  }

  setSeconds(newSec) {
    const diff = newSec - this.sec;
    this.setTo(this.rawValueInSeconds + diff);
  }

  setTo(rawValueInSeconds) {
    this.rawValueInSeconds = rawValueInSeconds;

    let secondsLeft = rawValueInSeconds;

    this.hrs = secondsLeft >= 3600 ? Math.floor(secondsLeft / 3600) : 0;
    secondsLeft = secondsLeft - (this.hrs * 3600);
    this.min = secondsLeft >= 60 ? Math.floor(secondsLeft / 60) : 0;
    secondsLeft = secondsLeft - (this.min * 60);
    this.sec = secondsLeft >= 0 ? secondsLeft : 0;
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
Utilities.addMixin(SubjectPropMixin, TimerCounterValue);

/**
 * Represents a timer
 */
class Timer {

  constructor(timerId, hrs, min, sec) {
    this._id = timerId;
    this.elem = document.getElementById(`timer-${timerId}`);
    this.isRunning = false;
    this.interval = null;
    this.initialTotalSeconds = hrs*3600 + min*60 + sec;

    this.createSubjectsAndObservers();
    this.initSubjectsAndObservers();
    this.addEventListenersToButtons();

    /* ======== RANDOM STUFF ========
    this.elem.querySelector('#sec-000').addEventListener(
      'keyup',
      this.updateInputUI.bind(this)
    );*/
  }

  createSubjectsAndObservers() {
    this.title = new SubjectProp(`Timer ${+this._id}`);
    this.titleElem = new ObserverElem(
      this.elem.querySelector(`#title-${this._id}`),
      this.title,
      (observer) => {
        observer.elem.value = observer.subjectProp.getState();
      },
      true
    );
    this.counterVal = new TimerCounterValue(this.initialTotalSeconds);
    this.hrsElem = new ObserverElem(
      this.elem.querySelector(`#hrs-${this._id}`),
      this.counterVal,
      (observer) =>  {
        observer.elem.value = Utilities.fillDecimalPlaces(
          observer.subjectProp.getHours.toString(),
          2
        );
      },
      true
    );
    this.minElem = new ObserverElem(
      this.elem.querySelector(`#min-${this._id}`),
      this.counterVal,
      (observer) => {
        observer.elem.value = Utilities.fillDecimalPlaces(
          observer.subjectProp.getMinutes.toString(),
          2
        );
      },
      true
    );
    this.secElem = new ObserverElem(
      this.elem.querySelector(`#sec-${this._id}`),
      this.counterVal,
      (observer) => {
        observer.elem.value = Utilities.fillDecimalPlaces(
          observer.subjectProp.getSeconds.toString(),
          2
        );
      },
      true
    );
    this.progressBarElem = new ObserverElem(
      this.elem.querySelector(`#progress-bar-${this._id}`),
      this.counterVal,
      (observer) => {
        observer.elem.querySelector('.progress-bar__bar').style.width
          = `${(
          (this.initialTotalSeconds - observer.subjectProp.getRawValueInSeconds) /
          this.initialTotalSeconds
          )*100}%`;
      }
    );
  }

  initSubjectsAndObservers() {
    this.counterVal.attach(this.hrsElem);
    this.counterVal.attach(this.minElem);
    this.counterVal.attach(this.secElem);
    this.counterVal.attach(this.progressBarElem);
    this.counterVal.notify();

    this.title.attach(this.titleElem);
    this.title.notify();
  }

  addEventListenersToButtons() {
    this.elem.querySelector('.btn--main').addEventListener(
      'click',
      this.startToggle.bind(this)
    );
    this.elem.querySelector('.btn--phantom').addEventListener(
      'click',
      this.reset.bind(this)
    );
  }

  /* ======== RANDOM STUFF ========
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
  }*/

  /* ======== RANDOM STUFF ========
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
  }*/

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
    window.alert(`${this.title.getState()} has finished!`);
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

  console.log('\tfillDecimalPlaces() works');
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

  console.log('\tsubtractSeconds() works');
  counterVal.subtractSeconds(2);
  console.assert(counterVal.getHours === 1);
  console.assert(counterVal.getMinutes === 0);
  console.assert(counterVal.getSeconds === 59);

  console.log('\tsetHours() works');
  counterVal.setHours(2);
  console.assert(counterVal.getHours === 2);
  console.assert(counterVal.getMinutes === 0);
  console.assert(counterVal.getSeconds === 59);

  console.log('\tsetMinutes() works');
  counterVal.setMinutes(1);
  console.assert(counterVal.getHours === 2);
  console.assert(counterVal.getMinutes === 1);
  console.assert(counterVal.getSeconds === 59);

  console.log('\tsetSeconds() works');
  counterVal.setSeconds(2);
  console.assert(counterVal.getHours === 2);
  console.assert(counterVal.getMinutes === 1);
  console.assert(counterVal.getSeconds === 2);
}

function Test() {
  UtilitiesTest();
  TimerCounterValueTest();
}

(function () {

  const timer = new Timer('000', 0, 0, 5);

  //Test();
}())