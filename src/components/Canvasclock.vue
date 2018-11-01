<template>
  <canvas :id="id" :width="width" :height="height">
    当前浏览器不支持canvas<i>(降级处理)</i>
  </canvas>
</template>

<script>
export default {
  data: function() {
    return {
      dom: null,
      ctx: null,
      r: 200 / 2,
      rem: 200 / 200
    };
  },
  props: ["id", "width", "height"],
  mounted: function() {
    this.init(this.id);
    this.draw();
    this.loop();
  },
  methods: {
    init: function(id) {
      var that = this;
      that.dom = document.getElementById(id);
      that.ctx = that.dom.getContext("2d");
      if (!that.ctx) {
        console.warn("该浏览器不支持该方法");
        return;
      }
      if (!that.width) {
        that.width = 200;
      }
      if (!that.height) {
        that.height = 200;
      }
      that.r = that.width / 2;
      that.rem = that.width / 200;
    },
    _drawBackground: function() {
      var that = this;
      that.ctx.save();
      that.ctx.translate(that.r, that.r);
      that.ctx.beginPath();
      that.ctx.lineWidth = 8 * that.rem;
      that.ctx.arc(
        0,
        0,
        that.r - that.ctx.lineWidth / 2,
        0,
        2 * Math.PI,
        false
      );
      that.ctx.stroke();

      var hourNumbers = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];
      that.ctx.font = 18 * that.rem + "px Arial";
      that.ctx.textAlign = "center";
      that.ctx.textBaseline = "middle";
      hourNumbers.forEach(function(number, i) {
        var rad = 2 * Math.PI / 12 * i;
        var x = Math.cos(rad) * (that.r - 30 * that.rem);
        var y = Math.sin(rad) * (that.r - 30 * that.rem);
        that.ctx.fillText(number, x, y);
      });

      for (var i = 0; i < 60; i++) {
        var rad = 2 * Math.PI / 60 * i;
        var x = Math.cos(rad) * (that.r - 18 * that.rem);
        var y = Math.sin(rad) * (that.r - 18 * that.rem);
        that.ctx.beginPath();
        if (i % 5 === 0) {
          that.ctx.fillStyle = "#000";
          that.ctx.arc(x, y, 2 * that.rem, 0, 2 * Math.PI, false);
        } else {
          that.ctx.fillStyle = "#ccc";
          that.ctx.arc(x, y, 2 * that.rem, 0, 2 * Math.PI, false);
        }
        that.ctx.fill();
      }
    },
    _drawHour: function(hour, minute) {
      var that = this;
      that.ctx.save();
      that.ctx.beginPath();
      var rad = 2 * Math.PI / 12 * hour;
      var mrad = 2 * Math.PI / 12 / 60 * minute;
      that.ctx.rotate(rad + mrad);
      that.ctx.lineWidth = 6 * that.rem;
      that.ctx.lineCap = "round";
      that.ctx.moveTo(0, 10 * that.rem);
      that.ctx.lineTo(0, -that.r / 2);
      that.ctx.stroke();
      that.ctx.restore();
    },
    _drawMinute: function(minute) {
      var that = this;
      that.ctx.save();
      that.ctx.beginPath();
      var rad = 2 * Math.PI / 60 * minute;
      that.ctx.rotate(rad);
      that.ctx.lineWidth = 3 * that.rem;
      that.ctx.lineCap = "round";
      that.ctx.moveTo(0, 10 * that.rem);
      that.ctx.lineTo(0, -that.r + 30 * that.rem);
      that.ctx.stroke();
      that.ctx.restore();
    },
    _drawSecond: function(second) {
      var that = this;
      that.ctx.save();
      that.ctx.beginPath();
      that.ctx.fillStyle = "red";
      var rad = 2 * Math.PI / 60 * second;
      that.ctx.rotate(rad);
      that.ctx.moveTo(-2 * that.rem, 20 * that.rem);
      that.ctx.lineTo(2 * that.rem, 20 * that.rem);
      that.ctx.lineTo(1, -that.r + 18 * that.rem);
      that.ctx.lineTo(-1, -that.r + 18 * that.rem);
      that.ctx.fill();
      that.ctx.restore();
    },
    _drawDot: function() {
      var that = this;
      that.ctx.beginPath();
      that.ctx.fillStyle = "#fff";
      that.ctx.arc(0, 0, 3 * that.rem, 0, 2 * Math.PI, false);
      that.ctx.fill();
    },
    draw: function() {
      if (this.dom === null || this.ctx === null) {
        console.warn("未调用初始化函数");
        return;
      }
      var that = this;
      that.ctx.clearRect(0, 0, that.width, that.height);
      var now = new Date();
      that._drawBackground();
      that._drawHour(now.getHours(), now.getMinutes());
      that._drawMinute(now.getMinutes());
      that._drawSecond(now.getSeconds());
      that._drawDot();
      that.ctx.restore();
      return now;
    },
    loop: function() {
      var that = this;
      setInterval(function() {
        that.draw();
      }, 1000);
    }
  }
};
</script>