document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultContainer = document.getElementById('result');
    const charCounter = document.querySelector('.char-counter');
    const exampleBtns = document.querySelectorAll('.example-btn');

    // Обработка примеров
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            textInput.value = btn.dataset.text;
            updateCharCounter();
        });
    });

    // Обновление счетчика символов
    function updateCharCounter() {
        const count = textInput.value.length;
        charCounter.textContent = `${count} символов`;
    }

    textInput.addEventListener('input', updateCharCounter);

    analyzeBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        
        if (!text) {
            showError('Пожалуйста, введите текст для анализа');
            return;
        }

        try {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Анализируем...';
            
            const response = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('Ошибка анализа');
            }

            const data = await response.json();
            showResult(data);
        } catch (error) {
            showError('Не удалось выполнить анализ. Пожалуйста, попробуйте снова.');
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Анализировать';
        }
    });

    function showResult(data) {
        const sentimentText = data.sentiment === 'positive' ? 'позитивный' : 'негативный';
        const confidence = (data.score * 100).toFixed(1);
        
        resultContainer.innerHTML = `
            <h3>Результат анализа:</h3>
            <p>Тональность: <span class="${data.sentiment}">${sentimentText}</span></p>
            <p>Уверенность: ${confidence}%</p>
            <div class="confidence-bar" style="
                background: linear-gradient(to right, 
                    ${data.sentiment === 'positive' ? '#27ae60' : '#e74c3c'} ${confidence}%, 
                    #eee ${confidence}%
                );
                height: 10px;
                border-radius: 5px;
                margin-top: 10px;
            "></div>
        `;
        resultContainer.classList.add('visible');
    }

    function showError(message) {
        resultContainer.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i> ${message}
            </div>
        `;
        resultContainer.classList.add('visible');
    }

    // Инициализация счетчика символов
    updateCharCounter();
}); 