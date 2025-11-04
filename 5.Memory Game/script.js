const moveDisplay = document.getElementById('moves-display');
const timerDisplay = document.getElementById('timer-display');
const container = document.querySelector('.container');
const starsItems = document.querySelectorAll('.stars-item')
const fastestTime = document.querySelector('.fastest-time');
const fastestTimeDisplay = document.querySelector('.fastest-time-display');

const emojis = ["😂", "😂", "😍", "😍", "😒", "😒", "😘", "😘", "💕", "💕", "👍", "👍", "😎", "😎", "🥰", "🥰"];
const BEST_TIME_KEY = 'memoryGameBestTime';

// 核心目标：随机打乱数组
// emojis.sort()用于对数组进行排序，sort()可以接受一个可选的比较函数 (compare function) 作为参数，用于决定两个元素 a 和 b 谁应该排在前面
// 当 sort(compareFunction) 执行时，它会多次调用 compareFunction(a, b)，返回正数 b 排在 a 前，返回负数 则 a 排在 b 前
// 这里 Math.random()生成一个 0 到 1 之间的随机浮点数，并根据结果返回正数或者负数，来决定是否交换两个元素的位置
const shuf_emojis = emojis.sort(() => (Math.random() > 0.5) ? 2 : -1);

// 记录玩家翻开卡片的总次数
let totalMove = 0;

// 记录玩家游戏的总时长
let totalTime = 0;

// 定时器启动标识符与ID
let timerStart = true;
let timerStop = false;
let timeoutId = "";

// 格式化当前时间函数
function updateTime() {
    // 1. 时间自增
    totalTime++;

    // 2. 计算当前的秒数和分钟数
    const currMinutes = Math.floor(totalTime / 60);
    const currSecond = totalTime % 60;

    // 3. 格式化当前时间
    const formattedTime = 
        `Time: ${currMinutes.toString().padStart(2, '0')}:${currSecond.toString().padStart(2, '0')}`;

    // 4. 更新 UI
    timerDisplay.textContent = formattedTime;

    // 5. 如果游戏没有结束，设置一个超时任务继续计时
    if (!timerStop) {
        timeoutId = setTimeout(updateTime, 1000);
    }
}

// 根据所用步数获得星级评分
function getStarsRating() {
    if (totalMove <= 12) {
        return 3;
    } else if (totalMove <= 18) {
        return 2;
    } else {
        return 1;
    }
}

// 获取当前记录下的最快时间
function getFastestTime() {
    const storedTime = localStorage.getItem(BEST_TIME_KEY);
    return storedTime == null ? Infinity : parseInt(storedTime);
}

for (let i = 0; i < emojis.length; i++) {
    // 为每一个 emoji 创建一个新的 div 元素
    let box = document.createElement('div');

    // 给新的元素新类名 item，并将其中的内容更换为乱序后的 emoji
    box.className = 'item';
    box.innerHTML = shuf_emojis[i];

    // 为每一个 emoji 绑定点击事件函数，即每张卡片被点击时自动执行所编写的 function
    box.onclick = function () {
        // 如果是第一次点击，那么启动定时器开始计时，否则忽略
        if (timerStart) {
            timerStart = !timerStart;
            updateTime();
        }

        // 如果卡片已经被点击了那就不再执行操作
        if (this.classList.contains('boxMatch')) return;

        // 1. 向被点击的卡片增加 boxOpen 类，执行相应的动画
        this.classList.add('boxOpen');

        // 2. 每一个被点击的卡片都会被添加一个 boxOpen 类，这里利用 boxOpen 类的数量来判断点击了几张卡片
        if (document.querySelectorAll('.boxOpen').length > 1) {
            // 增加翻开卡片的次数并更新 UI 显示
            totalMove++;
            moveDisplay.textContent = "Total Step: " + totalMove.toString();

            // setTimeout(function, delay)：先延时 delay 时间(以毫秒为单位)，然后再执行 function 函数
            // 这里先延时的作用时让玩家能够看到第二张牌上的 emoji，然后再进行匹配判断和翻回等操作
            setTimeout(() => {
                // 利用 boxOpen 获取当前所有被点击的卡片
                const openBoxes = document.querySelectorAll('.boxOpen');

                // 检查被点击的卡片上的 emoji 是否相同
                if (openBoxes[0].innerHTML === openBoxes[1].innerHTML) {

                    // 如果两张卡片上的 emoji 相同：为两张卡片添加 boxMatch 类，执行相应动画
                    openBoxes[0].classList.add('boxMatch');
                    openBoxes[1].classList.add('boxMatch');

                }

                // 无论两张卡片上的 emoji 是否相同，都要移除所含有的 boxOpen 类，防止对下一次的匹配造成影响
                openBoxes[0].classList.remove('boxOpen');
                openBoxes[1].classList.remove('boxOpen');

                // 根据 boxMatch 类的数量检查是否胜利，条件为含有 boxMatch 类的卡片与 emoji 数量一致
                if (document.querySelectorAll('.boxMatch').length === emojis.length) {
                    // 定时器停止工作
                    timerStop = !timerStop;
                    clearTimeout(timeoutId);

                    // 根据总步数获得星级评分，并更改相关样式
                    container.classList.add('game-over');
                    fastestTime.classList.add('game-over');

                    const starsRating = getStarsRating();
                    starsItems.forEach((starsItem, index) => {
                        if (index + 1 <= starsRating) {
                            starsItem.classList.add('active');
                        }
                    })

                    // 更改游戏最快时间
                    const oldtTime = getFastestTime();
                    const currFastestTime = oldtTime > totalTime ? totalTime : oldtTime;
                    fastestTimeDisplay.textContent = "Fastest Time: " + currFastestTime.toString();
                    localStorage.setItem(BEST_TIME_KEY, currFastestTime.toString());

                    // 弹出提示信息
                    alert("win!");
                }

            }, 500); // 500ms 延迟，让用户看到第二张牌
        }
    }

    // 将创建的 div 元素作为 game 类的子元素
    document.querySelector('.game').appendChild(box);
}