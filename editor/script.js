document.addEventListener('DOMContentLoaded', () => {
    // ダークモード検出
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (event.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    });

    // 画面の高さから計算したグリッドの最大行数
    let onload_h = document.getElementById('onload-size').clientHeight;
    // const rowHeight = 50;←旧来の仕様
    const calculatedRows = Math.floor(window.innerHeight / (onload_h / 1.8));
    const maxRows = calculatedRows - 1;
    console.log("要素のサイズ" + onload_h);
    console.log("高さ" + window.innerHeight);
    console.log("グリット最大サイズ" + maxRows);

    let grid = GridStack.init({
        maxRow: maxRows,
        column: 12,
        float: true,
        disableOneColumnMode: true,
        margin: '5px',
        disable: false
    });

    // 編集モードを切り替えるボタンの機能
    const toggleButton = document.getElementById('toggle-mode-btn');
    let isEditingMode = true;

    // 削除ボタンとカーソルのスタイルを切り替える共通関数
    const toggleInteractiveElements = (isEditable) => {
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.style.display = isEditable ? 'flex' : 'none';
        });
        document.querySelectorAll('.grid-stack-item').forEach(item => {
            // 編集可能ならカーソルを'grab'に、そうでなければ'default'に設定
            item.style.cursor = isEditable ? 'grab' : 'default';
        });
    };

    var butoggle = document.getElementById('toggle-mode-btn');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            if (isEditingMode) {
                grid.disable();
                butoggle.style.backgroundColor = '#ff6969';
                toggleButton.textContent = '閲覧モード';
                toggleInteractiveElements(false); // 閲覧モード用のスタイルを適用
            } else {
                grid.enable();
                butoggle.style.backgroundColor = '#80ccff';
                toggleButton.textContent = '編集モード';
                toggleInteractiveElements(true); // 編集モード用のスタイルを適用
            }
            isEditingMode = !isEditingMode;
        });
    }

    let itemCount = 1;

    // --- 色の選択機能 ---
    let currentColor = '#80ccff'; // 初期の色
    const colorButtons = document.querySelectorAll('.color-button');
    const colorPicker = document.getElementById('color-picker');

    // 初期状態でカラーピッカーの色を反映
    colorPicker.value = currentColor;

    const selectColor = (color) => {
        currentColor = color;
        // 選択されたボタンに'selected'クラスを追加し、他のボタンから削除
        colorButtons.forEach(btn => btn.classList.remove('selected'));
        const selectedBtn = document.querySelector(`[data-color="${color}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        // カラーピッカーの色も同期
        colorPicker.value = color;
    };

    // カラーボタンのイベントリスナー
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectColor(button.dataset.color);
        });
    });

    // カラーピッカーのイベントリスナー
    if (colorPicker) {
        colorPicker.addEventListener('input', (e) => {
            selectColor(e.target.value);
        });
    }

    // 初期選択色を設定
    selectColor(currentColor);

    // 選択されたアイテムを追跡する変数
    let selectedItem = null;

    // 色選択時に選択されたアイテムの色を変更
    const updateSelectedItemColor = (color) => {
        if (selectedItem) {
            selectedItem.style.backgroundColor = color;
        }
    };

    // カラーボタンとカラーピッカーのイベントリスナーを更新
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectColor(button.dataset.color);
            updateSelectedItemColor(button.dataset.color);
        });
    });

    if (colorPicker) {
        colorPicker.addEventListener('input', (e) => {
            selectColor(e.target.value);
            updateSelectedItemColor(e.target.value);
        });
    }

    // ▼▼▼ ここから追加 ▼▼▼
    // --- 背景色の変更機能 ---
    const backgroundColorPicker = document.getElementById('background-color-picker');
    if (backgroundColorPicker) {
        backgroundColorPicker.addEventListener('input', (e) => {
            document.body.style.backgroundColor = e.target.value;
        });
    }

    // --- 背景画像の変更機能 ---
    const bgImageUploadArea = document.getElementById('bg-image-upload');
    const bgImageInput = document.getElementById('bg-image-input');
    const bgImagePreviewContainer = document.querySelector('.bg-image-preview-container');
    const bgImagePreview = document.querySelector('.bg-image-preview');
    const changeBgImageBtn = document.getElementById('change-bg-image');
    const removeBgImageBtn = document.getElementById('remove-bg-image');
    const bgDisplayModeSelect = document.getElementById('bg-display-mode');

    // 背景画像のファイル読み込み処理
    const handleBgFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            showAlert('画像ファイルを選択してください。');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            bgImagePreview.src = imageData;
            document.body.style.backgroundImage = `url(${imageData})`;
            document.body.style.backgroundSize = bgDisplayModeSelect.value === 'repeat' ? 'auto' : bgDisplayModeSelect.value;
            document.body.style.backgroundRepeat = bgDisplayModeSelect.value === 'repeat' ? 'repeat' : 'no-repeat';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';

            bgImageUploadArea.style.display = 'none';
            bgImagePreviewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    };

    // 背景画像のクリックでファイル選択
    bgImageUploadArea.addEventListener('click', () => {
        bgImageInput.click();
    });

    // 背景画像のファイル選択時の処理
    bgImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleBgFile(file);
        }
    });

    // 背景画像のドラッグ&ドロップ処理
    bgImageUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        bgImageUploadArea.classList.add('dragover');
    });

    bgImageUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        bgImageUploadArea.classList.remove('dragover');
    });

    bgImageUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        bgImageUploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            handleBgFile(file);
        }
    });

    // 背景画像変更ボタン
    changeBgImageBtn.addEventListener('click', () => {
        bgImageInput.click();
    });

    // 背景画像削除ボタン
    removeBgImageBtn.addEventListener('click', () => {
        document.body.style.backgroundImage = '';
        bgImagePreview.src = '';
        bgImageUploadArea.style.display = 'block';
        bgImagePreviewContainer.style.display = 'none';
        bgImageInput.value = '';
    });

    // 背景画像表示モード変更
    bgDisplayModeSelect.addEventListener('change', (e) => {
        const mode = e.target.value;
        if (document.body.style.backgroundImage) {
            document.body.style.backgroundSize = mode === 'repeat' ? 'auto' : mode;
            document.body.style.backgroundRepeat = mode === 'repeat' ? 'repeat' : 'no-repeat';
        }
    });
    // ▲▲▲ ここまで追加 ▲▲▲

    // RGB値をHEX形式に変換する関数
    function rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent') return '#9370db';
        if (rgb.startsWith('#')) return rgb;

        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return '#9370db';

        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);

        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // カスタムモーダル関数（alert の代替）
    function showAlert(message) {
        // 既存のモーダルがあれば削除
        const existingModal = document.querySelector('.custom-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;';

        const modalContent = document.createElement('div');
        modalContent.style.cssText = 'background: white; padding: 20px; border-radius: 8px; max-width: 400px; margin: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';

        const messageP = document.createElement('p');
        messageP.style.cssText = 'margin: 0 0 15px 0; color: black; font-size: 14px;';
        messageP.textContent = message;

        const buttonDiv = document.createElement('div');
        buttonDiv.style.cssText = 'text-align: right;';

        const okButton = document.createElement('button');
        okButton.style.cssText = 'padding: 8px 16px; background: #5D5CDE; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;';
        okButton.textContent = 'OK';

        // クリックイベントでモーダルを削除
        okButton.addEventListener('click', () => {
            modal.remove();
        });

        // モーダル背景クリックでも閉じる
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        buttonDiv.appendChild(okButton);
        modalContent.appendChild(messageP);
        modalContent.appendChild(buttonDiv);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // フォーカスをOKボタンに設定
        okButton.focus();
    }

    // 画像ウィジェット作成関数
    const createImageWidget = () => {
        const uniqueId = `image-widget-${itemCount}`;
        return `
                    <div class="image-widget">
                        <div class="image-upload-area" data-widget-id="${uniqueId}">
                            <div class="upload-text">
                                クリックまたはドラッグ&ドロップで画像をアップロード<br>
                                (JPG, PNG, GIF, WebP対応)
                            </div>
                            <input type="file" class="image-upload-input" accept="image/*" data-widget-id="${uniqueId}">
                        </div>
                        <div class="image-preview-container" style="display: none;">
                            <img class="image-preview" src="" alt="プレビュー">
                            <div class="image-controls">
                                <button class="change-image-btn" data-widget-id="${uniqueId}">画像を変更</button>
                                <button class="remove-image-btn" data-widget-id="${uniqueId}">画像を削除</button>
                            </div>
                        </div>
                    </div>
                `;
    };

    // 画像ウィジェットのイベントリスナーを設定する関数
    const setupImageWidgetEvents = (widgetElement) => {
        const widgetId = widgetElement.querySelector('.image-upload-area').dataset.widgetId;
        const uploadArea = widgetElement.querySelector(`.image-upload-area[data-widget-id="${widgetId}"]`);
        const uploadInput = widgetElement.querySelector(`.image-upload-input[data-widget-id="${widgetId}"]`);
        const previewContainer = widgetElement.querySelector('.image-preview-container');
        const previewImg = widgetElement.querySelector('.image-preview');
        const changeBtn = widgetElement.querySelector(`.change-image-btn[data-widget-id="${widgetId}"]`);
        const removeBtn = widgetElement.querySelector(`.remove-image-btn[data-widget-id="${widgetId}"]`);

        // ファイル読み込み処理
        const handleFile = (file) => {
            if (!file || !file.type.startsWith('image/')) {
                showAlert('画像ファイルを選択してください。');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                uploadArea.style.display = 'none';
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        };

        // クリックでファイル選択
        uploadArea.addEventListener('click', () => {
            uploadInput.click();
        });

        // ファイル選択時の処理
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleFile(file);
            }
        });

        // ドラッグ&ドロップ処理
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) {
                handleFile(file);
            }
        });

        // 画像変更ボタン
        changeBtn.addEventListener('click', () => {
            uploadInput.click();
        });

        // 画像削除ボタン
        removeBtn.addEventListener('click', () => {
            previewImg.src = '';
            uploadArea.style.display = 'block';
            previewContainer.style.display = 'none';
            uploadInput.value = '';
        });
    };

    // 共通のアイテム追加処理
    const addWidgetWithCustomDiv = (content, width, height) => {
        const itemId = `item-${itemCount}`;
        itemCount++;
        const el = document.createElement('div');
        // 選択された色を直接スタイルに適用
        el.innerHTML = `<div class="grid-stack-item-content" style="background-color: ${currentColor};">
                                    <div>${content}</div>
                                    <button class="remove-item-btn" style="display: ${isEditingMode ? 'flex' : 'none'};">X</button>
                                </div>`;

        // 明示的にIDを設定してアイテムを追加
        const newItem = grid.makeWidget(el, { w: width, h: height, id: itemId });

        const removeBtn = newItem.querySelector('.remove-item-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                grid.removeWidget(newItem);
            });
        }

        // 新しいアイテムにもカーソルスタイルを適用
        newItem.style.cursor = isEditingMode ? 'grab' : 'default';

        // 新しく追加されたアイテムにも色変更機能を追加
        const content_el = newItem.querySelector('.grid-stack-item-content');
        if (content_el) {
            content_el.addEventListener('click', (e) => {
                // 削除ボタンがクリックされた場合は無視
                if (e.target.classList.contains('remove-item-btn')) return;

                // 以前選択されたアイテムのボーダーを削除
                if (selectedItem) {
                    selectedItem.style.border = '';
                }

                // 新しく選択されたアイテムにボーダーを追加
                content_el.style.border = '3px solid #007bff';
                selectedItem = content_el;

                // 現在の色をカラーパレットに反映
                const currentBgColor = content_el.style.backgroundColor;
                if (currentBgColor) {
                    const hexColor = rgbToHex(currentBgColor);
                    selectColor(hexColor);
                }
            });
        }

        // 画像ウィジェットの場合はイベントリスナーを設定
        if (content.includes('image-widget')) {
            setupImageWidgetEvents(newItem);
        }

        return newItem;
    };

    //アイテムを追加するボタン
    //空白ブロック1を追加
    document.getElementById('add-item-btn').addEventListener('click', () => {
        addWidgetWithCustomDiv('', 1, 1);
    });
    //空白ブロック2を追加
    document.getElementById('add-item-btn2').addEventListener('click', () => {
        addWidgetWithCustomDiv('', 1, 4);
    });

    //操作バーを追加
    document.getElementById('add-item-btn3').addEventListener('click', () => {
        addWidgetWithCustomDiv('<div class="bar"><br><a href="#" class="example"><img src="https://spbase.stars.ne.jp/user-3-fill.png" alt="ねこ"></a><br><br><a><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20ZM11 13V19H13V13H11Z"></path></svg></a><br><br><a><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455Z"></path></svg></a><br><br><a><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C16.9706 2 21 6.04348 21 11.0314V20H3V11.0314C3 6.04348 7.02944 2 12 2ZM9.5 21H14.5C14.5 22.3807 13.3807 23.5 12 23.5C10.6193 23.5 9.5 22.3807 9.5 21Z"></path></svg></a><br><br><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5.33409 4.54491C6.3494 3.63637 7.55145 2.9322 8.87555 2.49707C9.60856 3.4128 10.7358 3.99928 12 3.99928C13.2642 3.99928 14.3914 3.4128 15.1245 2.49707C16.4486 2.9322 17.6506 3.63637 18.6659 4.54491C18.2405 5.637 18.2966 6.90531 18.9282 7.99928C19.5602 9.09388 20.6314 9.77679 21.7906 9.95392C21.9279 10.6142 22 11.2983 22 11.9993C22 12.7002 21.9279 13.3844 21.7906 14.0446C20.6314 14.2218 19.5602 14.9047 18.9282 15.9993C18.2966 17.0932 18.2405 18.3616 18.6659 19.4536C17.6506 20.3622 16.4486 21.0664 15.1245 21.5015C14.3914 20.5858 13.2642 19.9993 12 19.9993C10.7358 19.9993 9.60856 20.5858 8.87555 21.5015C7.55145 21.0664 6.3494 20.3622 5.33409 19.4536C5.75952 18.3616 5.7034 17.0932 5.0718 15.9993C4.43983 14.9047 3.36862 14.2218 2.20935 14.0446C2.07212 13.3844 2 12.7002 2 11.9993C2 11.2983 2.07212 10.6142 2.20935 9.95392C3.36862 9.77679 4.43983 9.09388 5.0718 7.99928C5.7034 6.90531 5.75952 5.637 5.33409 4.54491ZM13.5 14.5974C14.9349 13.7689 15.4265 11.9342 14.5981 10.4993C13.7696 9.0644 11.9349 8.57277 10.5 9.4012C9.06512 10.2296 8.5735 12.0644 9.40192 13.4993C10.2304 14.9342 12.0651 15.4258 13.5 14.5974Z"></path></svg><br><a class="logout"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 22C4.44772 22 4 21.5523 4 21V3C4 2.44772 4.44772 2 5 2H19C19.5523 2 20 2.44772 20 3V21C20 21.5523 19.5523 22 19 22H5ZM15 16L20 12L15 8V11H9V13H15V16Z"></path></svg></a></div>', 1, 6);
    });
    //検索バーを追加
    document.getElementById('add-item-btn4').addEventListener('click', () => {
        addWidgetWithCustomDiv('<div class="search"><button><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2C15.968 2 20 6.032 20 11C20 15.968 15.968 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2ZM11 18C14.8675 18 18 14.8675 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18ZM19.4853 18.0711L22.3137 20.8995L20.8995 22.3137L18.0711 19.4853L19.4853 18.0711Z"></path></svg>　</button><input type="search" id="site-search" name="q" placeholder="ここで検索"/></div>', 3, 1);
    });
    //グループタブを追加
    document.getElementById('add-item-btn5').addEventListener('click', () => {
        addWidgetWithCustomDiv('<div class="group"><h3>グループ一覧</h3><hr><div class="ingroup">ここにグループが表示されます</div></div>', 3, 2);
    });
    //フレンドタブを追加
    document.getElementById('add-item-btn6').addEventListener('click', () => {
        addWidgetWithCustomDiv('<div class="group"><h3>フレンド一覧</h3><hr><div class="ingroup">ここにフレンドが表示されます</div></div>', 3, 3);
    });
    //チャットウィンドウを追加
    document.getElementById('add-item-btn7').addEventListener('click', () => {
        addWidgetWithCustomDiv('<div class="chgroup"><h3>チャット</h3><hr><div class="ingroup">ここにチャット欄が表示されます</div><br><div class="chat"><input type="text"></input><button>送信</button></div></div>', 4, 5);
    });
    //画像ウィジェットを追加
    document.getElementById('add-item-btn8').addEventListener('click', () => {
        addWidgetWithCustomDiv(createImageWidget(), 3, 3);
    });
    //読み込み時に導入
    window.onload = function () {
        addWidgetWithCustomDiv('<div id="onload"><h2>※Block-UI Tips※</h2><h3>左下の矢印から編集メニューを表示できます<br>編集メニューはスクロールができます</h3><h3>アイテムの削除は左上のXをクリック<br>アイテムの拡張は右下の⤡をドラッグ</h3></div>', 4, 2);
    }

    // 既存のHTMLアイテムに削除ボタンとカーソルのイベントリスナーを設定
    document.querySelectorAll('.grid-stack-item').forEach(item => {
        const removeBtn = item.querySelector('.remove-item-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                grid.removeWidget(item);
            });
            removeBtn.style.display = isEditingMode ? 'flex' : 'none';
        }
        // カーソルスタイルを初期状態に合わせて設定
        item.style.cursor = isEditingMode ? 'grab' : 'default';
    });

    // --- 保存・読み込み機能 ---
    document.getElementById('save-local-btn').addEventListener('click', () => {
        // GridStackのデータを取得し、背景色情報を追加
        const items = grid.save(false);

        items.forEach(item => {
            const el = grid.engine.nodes.find(n => n.id === item.id)?.el;

            if (el) {
                const content = el.querySelector('.grid-stack-item-content');

                if (content) {
                    let backgroundColor = content.style.backgroundColor;
                    if (!backgroundColor) {
                        backgroundColor = window.getComputedStyle(content).backgroundColor;
                    }
                    const hexColor = rgbToHex(backgroundColor);
                    item.backgroundColor = hexColor;

                    const contentDiv = content.querySelector('div');
                    if (contentDiv) {
                        item.content = contentDiv.innerHTML;
                    }

                    // 画像ウィジェットの画像データも保存
                    const imagePreview = content.querySelector('.image-preview');
                    if (imagePreview && imagePreview.src && imagePreview.src.startsWith('data:')) {
                        item.imageData = imagePreview.src;
                    }
                }
            }
        });

        // ▼▼▼ ここから変更 ▼▼▼
        // レイアウトデータ、背景色、背景画像を1つのオブジェクトにまとめる
        const saveData = {
            layout: items,
            backgroundColor: document.body.style.backgroundColor || '#ffffff',
            backgroundImage: document.body.style.backgroundImage || '',
            backgroundSize: document.body.style.backgroundSize || '',
            backgroundRepeat: document.body.style.backgroundRepeat || '',
            backgroundPosition: document.body.style.backgroundPosition || '',
            backgroundAttachment: document.body.style.backgroundAttachment || ''
        };
        localStorage.setItem('gridstackLayout', JSON.stringify(saveData));
        // ▲▲▲ ここまで変更 ▲▲▲

        showAlert('レイアウトをブラウザに保存しました！');
    });

    document.getElementById('load-local-btn').addEventListener('click', () => {
        const storedLayoutJSON = localStorage.getItem('gridstackLayout');
        if (storedLayoutJSON) {
            const storedData = JSON.parse(storedLayoutJSON);

            // ▼▼▼ ここから変更 ▼▼▼
            let layout, backgroundColor;

            // 保存データの形式をチェック（古い形式との互換性のため）
            if (Array.isArray(storedData)) {
                layout = storedData;
                backgroundColor = '#ffffff'; // 古いデータには背景色がないためデフォルト値を設定
            } else {
                layout = storedData.layout;
                backgroundColor = storedData.backgroundColor;
            }

            // 背景色を適用
            document.body.style.backgroundColor = backgroundColor;
            if (backgroundColorPicker) {
                backgroundColorPicker.value = rgbToHex(backgroundColor); // カラーピッカーにも色を反映
            }

            // 背景画像を復元
            if (storedData.backgroundImage) {
                document.body.style.backgroundImage = storedData.backgroundImage;
                document.body.style.backgroundSize = storedData.backgroundSize || 'cover';
                document.body.style.backgroundRepeat = storedData.backgroundRepeat || 'no-repeat';
                document.body.style.backgroundPosition = storedData.backgroundPosition || 'center';
                document.body.style.backgroundAttachment = storedData.backgroundAttachment || 'fixed';

                // UIの状態も更新
                const imageUrl = storedData.backgroundImage.match(/url\(["']?([^"']*)["']?\)/);
                if (imageUrl && imageUrl[1]) {
                    bgImagePreview.src = imageUrl[1];
                    bgImageUploadArea.style.display = 'none';
                    bgImagePreviewContainer.style.display = 'block';

                    // 表示モードセレクトボックスの値を設定
                    const bgSize = storedData.backgroundSize;
                    const bgRepeat = storedData.backgroundRepeat;
                    if (bgRepeat === 'repeat') {
                        bgDisplayModeSelect.value = 'repeat';
                    } else if (bgSize) {
                        bgDisplayModeSelect.value = bgSize;
                    }
                }
            }
            // ▲▲▲ ここまで変更 ▲▲▲

            grid.removeAll();

            // カスタムアイテムとして復元
            layout.forEach(item => {
                const el = document.createElement('div');
                const content = item.content || 'アイテム';
                const bgColor = item.backgroundColor || '#9370db';

                el.innerHTML = `<div class="grid-stack-item-content" style="background-color: ${bgColor};">
                                            <div>${content}</div>
                                            <button class="remove-item-btn" style="display: ${isEditingMode ? 'flex' : 'none'};">X</button>
                                        </div>`;

                const newItem = grid.addWidget(el, {
                    x: item.x,
                    y: item.y,
                    w: item.w,
                    h: item.h,
                    id: item.id
                });

                const removeBtn = newItem.querySelector('.remove-item-btn');
                if (removeBtn) {
                    removeBtn.addEventListener('click', () => {
                        grid.removeWidget(newItem);
                    });
                }

                const content_el = newItem.querySelector('.grid-stack-item-content');
                if (content_el) {
                    content_el.addEventListener('click', (e) => {
                        if (e.target.classList.contains('remove-item-btn')) return;

                        if (selectedItem) {
                            selectedItem.style.border = '';
                        }
                        content_el.style.border = '3px solid #007bff';
                        selectedItem = content_el;

                        const currentBgColor = content_el.style.backgroundColor;
                        if (currentBgColor) {
                            const hexColor = rgbToHex(currentBgColor);
                            selectColor(hexColor);
                        }
                    });
                }
                newItem.style.cursor = isEditingMode ? 'grab' : 'default';

                // 画像ウィジェットの場合はイベントリスナーを設定し、画像データを復元
                if (content.includes('image-widget')) {
                    setupImageWidgetEvents(newItem);

                    // 保存された画像データがある場合は復元
                    if (item.imageData) {
                        const imagePreview = newItem.querySelector('.image-preview');
                        const uploadArea = newItem.querySelector('.image-upload-area');
                        const previewContainer = newItem.querySelector('.image-preview-container');

                        if (imagePreview && uploadArea && previewContainer) {
                            imagePreview.src = item.imageData;
                            uploadArea.style.display = 'none';
                            previewContainer.style.display = 'block';
                        }
                    }
                }
            });
            toggleInteractiveElements(isEditingMode);
            showAlert('保存したレイアウトを読み込みました！');
        } else {
            showAlert('ブラウザに保存されたレイアウトがありません。');
        }
    });

    document.getElementById('save-file-btn').addEventListener('click', () => {
        const items = grid.save(false);
        items.forEach(item => {
            const el = grid.engine.nodes.find(n => n.id === item.id)?.el;
            if (el) {
                const content = el.querySelector('.grid-stack-item-content');
                if (content) {
                    const backgroundColor = window.getComputedStyle(content).backgroundColor;
                    item.backgroundColor = rgbToHex(backgroundColor);
                    const contentDiv = content.querySelector('div');
                    if (contentDiv) {
                        item.content = contentDiv.innerHTML;
                    }

                    // 画像ウィジェットの画像データも保存
                    const imagePreview = content.querySelector('.image-preview');
                    if (imagePreview && imagePreview.src && imagePreview.src.startsWith('data:')) {
                        item.imageData = imagePreview.src;
                    }
                }
            }
        });

        // ▼▼▼ ここから変更 ▼▼▼
        const saveData = {
            layout: items,
            backgroundColor: document.body.style.backgroundColor || '#ffffff',
            backgroundImage: document.body.style.backgroundImage || '',
            backgroundSize: document.body.style.backgroundSize || '',
            backgroundRepeat: document.body.style.backgroundRepeat || '',
            backgroundPosition: document.body.style.backgroundPosition || '',
            backgroundAttachment: document.body.style.backgroundAttachment || ''
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveData, null, 2));
        // ▲▲▲ ここまで変更 ▲▲▲

        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "gridstack_layout.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showAlert('レイアウトをJSONファイルとして保存しました！');
    });

    document.getElementById('load-file-btn').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const storedData = JSON.parse(e.target.result);

                    // ▼▼▼ ここから変更 ▼▼▼
                    let layout, backgroundColor;
                    if (Array.isArray(storedData)) {
                        layout = storedData;
                        backgroundColor = '#ffffff';
                    } else {
                        layout = storedData.layout;
                        backgroundColor = storedData.backgroundColor;
                    }
                    document.body.style.backgroundColor = backgroundColor;
                    if (backgroundColorPicker) {
                        backgroundColorPicker.value = rgbToHex(backgroundColor);
                    }

                    // 背景画像も復元（ファイル読み込み時）
                    if (storedData.backgroundImage) {
                        document.body.style.backgroundImage = storedData.backgroundImage;
                        document.body.style.backgroundSize = storedData.backgroundSize || 'cover';
                        document.body.style.backgroundRepeat = storedData.backgroundRepeat || 'no-repeat';
                        document.body.style.backgroundPosition = storedData.backgroundPosition || 'center';
                        document.body.style.backgroundAttachment = storedData.backgroundAttachment || 'fixed';

                        // UIの状態も更新
                        const imageUrl = storedData.backgroundImage.match(/url\(["']?([^"']*)["']?\)/);
                        if (imageUrl && imageUrl[1]) {
                            bgImagePreview.src = imageUrl[1];
                            bgImageUploadArea.style.display = 'none';
                            bgImagePreviewContainer.style.display = 'block';

                            // 表示モードセレクトボックスの値を設定
                            const bgSize = storedData.backgroundSize;
                            const bgRepeat = storedData.backgroundRepeat;
                            if (bgRepeat === 'repeat') {
                                bgDisplayModeSelect.value = 'repeat';
                            } else if (bgSize) {
                                bgDisplayModeSelect.value = bgSize;
                            }
                        }
                    }
                    // ▲▲▲ ここまで変更 ▲▲▲

                    grid.removeAll();

                    layout.forEach(item => {
                        const el = document.createElement('div');
                        const content = item.content || 'アイテム';
                        const bgColor = item.backgroundColor || '#9370db';

                        el.innerHTML = `<div class="grid-stack-item-content" style="background-color: ${bgColor};">
                                                    <div>${content}</div>
                                                    <button class="remove-item-btn" style="display: ${isEditingMode ? 'flex' : 'none'};">X</button>
                                                </div>`;

                        const newItem = grid.addWidget(el, {
                            x: item.x,
                            y: item.y,
                            w: item.w,
                            h: item.h,
                            id: item.id
                        });

                        const removeBtn = newItem.querySelector('.remove-item-btn');
                        if (removeBtn) {
                            removeBtn.addEventListener('click', () => {
                                grid.removeWidget(newItem);
                            });
                        }
                        newItem.style.cursor = isEditingMode ? 'grab' : 'default';

                        // 画像ウィジェットの場合はイベントリスナーを設定し、画像データを復元
                        if (content.includes('image-widget')) {
                            setupImageWidgetEvents(newItem);

                            // 保存された画像データがある場合は復元
                            if (item.imageData) {
                                const imagePreview = newItem.querySelector('.image-preview');
                                const uploadArea = newItem.querySelector('.image-upload-area');
                                const previewContainer = newItem.querySelector('.image-preview-container');

                                if (imagePreview && uploadArea && previewContainer) {
                                    imagePreview.src = item.imageData;
                                    uploadArea.style.display = 'none';
                                    previewContainer.style.display = 'block';
                                }
                            }
                        }
                    });
                    toggleInteractiveElements(isEditingMode);
                    showAlert('レイアウトをファイルから読み込みました！');
                } catch (error) {
                    showAlert('無効なファイル形式です。JSONファイルを選択してください。');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });

    // グリッドをクリアするボタン
    document.getElementById('clear-btn').addEventListener('click', () => {
        grid.removeAll();
        localStorage.removeItem('gridstackLayout');
        showAlert('グリッドのレイアウトをクリアしました。');
    });

    // --- 操作パネルの開閉機能 ---
    const togglePanelBtn = document.getElementById('toggle-panel-btn');
    const controlPanel = document.querySelector('.control-panel');
    const gridContainer = document.querySelector('.grid-stack');
    let isPanelOpen = false;

    if (togglePanelBtn && controlPanel && gridContainer) {
        togglePanelBtn.addEventListener('click', () => {
            if (isPanelOpen) {
                controlPanel.classList.remove('open');
                gridContainer.classList.remove('shifted');
            } else {
                controlPanel.classList.add('open');
                gridContainer.classList.add('shifted');
            }
            isPanelOpen = !isPanelOpen;
        });
    }
});
