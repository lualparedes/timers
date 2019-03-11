class Timer {

  constructor(timerId) {
    this._id = timerId;
    this.elemId = `timer-${timerId}`;
    this.elem = document.getElementById(this.elemId);
    this.isRunning = false;
    this.title = `Timer ${+timerId}`;
    this.hrs = 0;
    this.min = 0;
    this.sec = 0;

    this.elem.querySelector('.btn--main').addEventListener(
      'click',
      this.startToggle.bind(this)
    );
  }

  start() {
    console.log('start');
  }

  pause() {
    console.log('pause');
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

  reset() {

  }
}

(function () {
  console.log('hello!');
  const timer = new Timer('000');
}())