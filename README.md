# IDEF0 Editor

Production-ready локальный редактор IDEF0-диаграмм на React + TypeScript + Vite. Приложение работает без регистрации, backend API и базы данных: проект хранится в памяти браузера, автосохраняется в `localStorage`, импортируется и экспортируется как JSON-файл, а текущая диаграмма может быть выгружена в PNG, SVG и PDF.

## Возможности

- создание контекстной диаграммы и дочерних уровней декомпозиции;
- специализированные IDEF0 Function-блоки и внешние интерфейсные порты Input / Control / Output / Mechanism;
- строгая проверка допустимых сторон подключения для стрелок IDEF0;
- редактирование имени блока, подписи стрелки и свойств диаграммы в правой панели;
- дерево диаграмм, breadcrumb-навигация и переход в декомпозицию двойным кликом по блоку;
- автосохранение в `localStorage` с предложением восстановить несохранённый проект;
- undo / redo, snap to grid, minimap, масштабирование, multi-select и контекстное меню;
- экспорт текущей диаграммы в PNG / SVG / PDF и сохранение проекта в JSON.

## Стек

- React 19
- TypeScript (strict mode)
- Vite
- Tailwind CSS
- Zustand
- React Flow (`@xyflow/react`)
- html-to-image
- jsPDF
- nginx + Docker + Docker Compose

## Запуск локально без Docker

```bash
npm install
npm run dev
```

Дополнительно:

```bash
npm run lint
npm run build
```

## Запуск через Docker Compose

```bash
docker-compose up --build
```

После запуска приложение доступно на `http://localhost:8080`.

## Публикация контейнера в GHCR

В репозитории настроен workflow `.github/workflows/publish-container.yml`, который:

- собирает контейнер из `Dockerfile`;
- публикует образ в GitHub Container Registry (`ghcr.io`);
- запускается вручную через `workflow_dispatch`, а также автоматически при push в `main` и при push тега `v*`.

Основной образ публикуется как `ghcr.io/antonskalkin73/ulstu-idef0:latest`, а также с тегами ветки, git-тега и SHA коммита.

## Структура каталогов

```text
.
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── package.json
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── public/
│   └── favicon.svg
└── src/
    ├── app/
    │   └── App.tsx
    ├── components/
    │   ├── LeftSidebar.tsx
    │   ├── RightSidebar.tsx
    │   └── TopBar.tsx
    ├── entities/
    │   └── idef0/
    │       └── constants.ts
    ├── features/
    │   ├── diagram/
    │   │   ├── lib/
    │   │   │   └── flowMappers.ts
    │   │   ├── model/
    │   │   │   └── useIdef0Store.ts
    │   │   └── ui/
    │   │       ├── ArrowEdge.tsx
    │   │       ├── BoundaryPortNode.tsx
    │   │       ├── DiagramEditor.tsx
    │   │       └── FunctionNode.tsx
    │   ├── export/
    │   │   └── lib/
    │   │       └── exportDiagram.ts
    │   ├── project/
    │   │   └── lib/
    │   │       ├── projectFactory.ts
    │   │       ├── projectFile.ts
    │   │       └── projectStorage.ts
    │   └── validation/
    │       └── lib/
    │           └── validateProject.ts
    ├── shared/
    ├── types/
    │   └── idef0.ts
    ├── utils/
    │   ├── id.ts
    │   └── idef0.ts
    ├── index.css
    ├── main.tsx
    └── vite-env.d.ts
```

## JSON-формат проекта

Проект сериализуется в понятный JSON следующего вида:

```json
{
  "id": "project-...",
  "name": "Новый IDEF0-проект",
  "version": "1.0.0",
  "rootDiagramId": "diagram-...",
  "diagrams": [
    {
      "id": "diagram-...",
      "title": "Контекстная диаграмма",
      "nodeNumber": "A-0",
      "parentDiagramId": null,
      "parentNodeId": null,
      "isContext": true,
      "nodes": [
        {
          "id": "node-...",
          "kind": "function",
          "diagramId": "diagram-...",
          "name": "Обработать заказ",
          "nodeNumber": "A0",
          "position": { "x": 240, "y": 160 },
          "width": 220,
          "height": 120,
          "childDiagramId": "diagram-child-...",
          "notes": "Описание функции"
        },
        {
          "id": "node-...",
          "kind": "boundaryPort",
          "diagramId": "diagram-...",
          "name": "Внешний Input",
          "boundaryRole": "input",
          "position": { "x": 40, "y": 180 },
          "width": 140,
          "height": 56,
          "notes": ""
        }
      ],
      "arrows": [
        {
          "id": "arrow-...",
          "source": "node-source",
          "target": "node-target",
          "sourceHandle": "source-output",
          "targetHandle": "target-input",
          "arrowType": "input",
          "label": "Заявка"
        }
      ]
    }
  ],
  "settings": {
    "strictMode": true,
    "snapToGrid": true,
    "showMiniMap": true,
    "autoSave": true
  },
  "meta": {
    "createdAt": "2026-04-06T00:00:00.000Z",
    "updatedAt": "2026-04-06T00:00:00.000Z"
  }
}
```

### Что хранится в модели

- несколько диаграмм в одном проекте;
- ссылка диаграммы на `parentNodeId` и `parentDiagramId`;
- ссылка функционального блока на `childDiagramId`;
- координаты и размеры узлов;
- подписи стрелок;
- настройки редактора;
- метаданные проекта.

## Реализация IDEF0-специфики

- Function-блоки имеют стандартные стороны подключения: Input слева, Control сверху, Output справа, Mechanism снизу.
- При включённом строгом режиме недопустимое соединение блокируется.
- Для корректной работы контекстных диаграмм добавлены внешние интерфейсные порты ICOM. Через них удобно моделировать внешние Input / Control / Output / Mechanism потоки.
- Навигация по декомпозиции строится по дереву диаграмм и breadcrumb-пути.
- Валидация показывает ошибки и предупреждения, но warnings не блокируют сохранение JSON.

## Ограничения текущей реализации

- Полноценное ветвление и объединение стрелок на промежуточных узлах не реализовано визуально. Архитектура допускает расширение модели отдельными junction-элементами, но в текущей версии поддерживаются прямые связи node-to-node и port-to-node.
- Кнопка «Скачать все диаграммы» пока оставлена как заготовка UI; для реализации можно последовательно рендерить каждую диаграмму в скрытый canvas и архивировать результаты.
- Импорт JSON выполняет базовую структурную проверку без полноценной schema-валидации.

## Roadmap

- junction-узлы для ветвления и объединения стрелок;
- пакетный экспорт всех диаграмм;
- расширенная schema-валидация импортируемого JSON;
- дополнительные горячие клавиши и контекстные команды;
- печатные шаблоны и экспорт набора диаграмм в один PDF.
