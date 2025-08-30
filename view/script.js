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

    // GridStackを編集不可モードで初期化
    let grid = GridStack.init({
        column: 12,
        float: true,
        disableOneColumnMode: true,
        margin: '5px',
        staticGrid: true, // 編集を完全に無効化
        disable: true     // ドラッグ&ドロップを無効化
    });

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

    // カスタムアラート関数
    function showAlert(message) {
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

        okButton.addEventListener('click', () => {
            modal.remove();
        });

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

        okButton.focus();
    }

    // メッセージ表示/非表示関数
    function showMessage(message) {
        const messageEl = document.getElementById('loading-message');
        messageEl.textContent = message;
        messageEl.style.display = 'block';
    }

    function hideMessage() {
        document.getElementById('loading-message').style.display = 'none';
        document.getElementById('initial-message').style.display = 'none';
    }

    // レイアウト読み込み関数
    function loadLayout(layoutData) {
        showMessage('レイアウトを読み込み中...');

        let layout, backgroundColor;

        // 保存データの形式をチェック
        if (Array.isArray(layoutData)) {
            layout = layoutData;
            backgroundColor = '#ffffff';
        } else {
            layout = layoutData.layout;
            backgroundColor = layoutData.backgroundColor || '#ffffff';
        }

        // 背景色を適用
        document.body.style.backgroundColor = backgroundColor;

        // 背景画像を復元
        if (layoutData.backgroundImage) {
            document.body.style.backgroundImage = layoutData.backgroundImage;
            document.body.style.backgroundSize = layoutData.backgroundSize || 'cover';
            document.body.style.backgroundRepeat = layoutData.backgroundRepeat || 'no-repeat';
            document.body.style.backgroundPosition = layoutData.backgroundPosition || 'center';
            document.body.style.backgroundAttachment = layoutData.backgroundAttachment || 'fixed';
        }

        // 既存のアイテムをクリア
        grid.removeAll();

        // レイアウトアイテムを復元
        layout.forEach(item => {
            const el = document.createElement('div');
            const content = item.content || 'アイテム';
            const bgColor = item.backgroundColor || '#9370db';

            // 削除ボタンは表示しない
            el.innerHTML = `<div class="grid-stack-item-content" style="background-color: ${bgColor};">
                                        <div>${content}</div>
                                    </div>`;

            const newItem = grid.addWidget(el, {
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h,
                id: item.id
            });

            // 画像ウィジェットの画像データを復元
            if (content.includes('image-widget') && item.imageData) {
                const imagePreview = newItem.querySelector('.image-preview');
                const uploadArea = newItem.querySelector('.image-upload-area');
                const previewContainer = newItem.querySelector('.image-preview-container');

                if (imagePreview && uploadArea && previewContainer) {
                    imagePreview.src = item.imageData;
                    uploadArea.style.display = 'none';
                    previewContainer.style.display = 'block';
                }
            }
        });

        hideMessage();

        // レイアウト読み込み完了後、コントロールパネルを非表示にする
        setTimeout(() => {
            const previewControls = document.querySelector('.preview-controls');
            if (previewControls) {
                previewControls.style.opacity = '0';
                previewControls.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    previewControls.style.display = 'none';
                }, 500);
            }
        }, 1000); // 1秒後にフェードアウト開始

        showAlert('レイアウトを読み込みました！');
    }

    // ブラウザから読み込み
    document.getElementById('load-local-btn').addEventListener('click', () => {
        const storedLayoutJSON = localStorage.getItem('gridstackLayout');
        if (storedLayoutJSON) {
            try {
                const storedData = JSON.parse(storedLayoutJSON);
                loadLayout(storedData);
            } catch (error) {
                showAlert('保存されたデータの読み込みに失敗しました。');
            }
        } else {
            showAlert('ブラウザに保存されたレイアウトがありません。');
        }
    });

    // ファイルから読み込み
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
                    loadLayout(storedData);
                } catch (error) {
                    showAlert('無効なファイル形式です。正しいJSONファイルを選択してください。');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });

    // URLパラメータから自動読み込み（オプション）
    const urlParams = new URLSearchParams(window.location.search);
    const autoLoad = urlParams.get('autoload');
    if (autoLoad === 'local') {
        // ページ読み込み時に自動でローカルストレージから読み込み
        setTimeout(() => {
            document.getElementById('load-local-btn').click();
        }, 500);
    }
});