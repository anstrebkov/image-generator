import React, { useState } from 'react';
import { toast } from 'react-toastify';

const basicTranslations = {
  'черная': 'black',
  'пантера': 'panther',
  'киберпанк': 'cyberpunk',
  'ящерица': 'lizard',
  'дракон': 'dragon',
  'красный': 'red',
  'синий': 'blue',
  'зеленый': 'green',
  'кот': 'cat',
  'собака': 'dog',
  'робот': 'robot',
  'город': 'city',
  'космос': 'space',
  'природа': 'nature',
};

const fallbackTranslate = (text) => {
  const words = text.toLowerCase().split(' ');
  const translated = words.map((word) => basicTranslations[word] || word);
  return translated.join(' ');
};

const translateWithTimeout = async (text, timeout = 5000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch('https://translator.stronga791alice.workers.dev/', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        source_lang: 'ru',
        target_lang: 'en',
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
    }

    const result = await response.json();
    return result.response.translated_text;
  } catch (error) {
    console.warn('Ошибка перевода, используется резервный перевод:', error);
    return fallbackTranslate(text);
  }
};

const ImageGenerator = () => {
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [prompt, setPrompt] = useState('');
  const [steps, setSteps] = useState(6);

  const generateImage = async () => {
    setIsLoading(true);
    setError('');

    if (!prompt.trim()) {
      toast.error('Введите запрос для генерации изображения');
      setIsLoading(false);
      return;
    }

    try {
      const translatedText = await translateWithTimeout(prompt.trim());
      toast.success(`Переведенный запрос: ${translatedText}`);

      // Таймаут для запроса к API генерации изображений
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Таймаут 10 секунд

      const response = await fetch('https://app.stronga791alice.workers.dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: translatedText, steps }),
        signal: controller.signal, // Передаем сигнал для отмены запроса
      });

      clearTimeout(timeoutId); // Очищаем таймаут, если запрос успешен

      console.log('Ответ от API:', response); // Логгируем ответ

      if (!response.ok) {
        const errorData = await response.json(); // Логгируем тело ошибки
        console.error('Ошибка API:', errorData);
        throw new Error(errorData.error || 'Ошибка при генерации изображения');
      }

      const data = await response.json();
      console.log('Данные от API:', data); // Логгируем данные
      setImage(data.image);
      toast.success('Изображение успешно сгенерировано!');
    } catch (error) {
      console.error('Ошибка генерации изображения:', error);
      if (error.name === 'AbortError') {
        toast.error('Превышено время ожидания ответа от сервера. Попробуйте еще раз.');
      } else {
        toast.error('Не удалось сгенерировать изображение. Попробуйте еще раз.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveImage = () => {
    if (image) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${image}`;
      link.download = 'generated-image.png';
      link.click();
    }
  };

  return (
    <div className="glassmorphism p-8 max-w-2xl w-full space-y-6">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value.slice(0, 200))}
        placeholder="Введите запрос, например, 'киберпанк ящерица'"
        className="w-full p-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <input
        type="number"
        value={steps}
        onChange={(e) => setSteps(Math.min(Math.max(1, parseInt(e.target.value)), 10))}
        placeholder="Количество шагов (например, 6)"
        min={1}
        max={10}
        className="w-full p-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
      />
      <button
        onClick={generateImage}
        disabled={isLoading}
        className="button-gradient w-full font-semibold py-3 rounded-lg"
      >
        {isLoading ? 'Генерация изображения...' : 'Сгенерировать изображение 🎨'}
      </button>
      {error && <div className="text-red-500 text-center">{error}</div>}
      {image && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <img
            src={`data:image/png;base64,${image}`}
            alt="Сгенерированное изображение"
            className="w-full rounded-md"
          />
          <button
            onClick={saveImage}
            className="button-gradient w-full mt-4 font-semibold py-3 rounded-lg"
          >
            Сохранить изображение 💾
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;