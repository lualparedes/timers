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
    this.interval = null;

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

  timeIsUp() {
    if (this.hrs === 0 && this.min === 0 && this.sec === 0) {
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
      console.log('update');
    }
  }

  reset() {

  }
}

(function () {
  const timer = new Timer('000');
}())