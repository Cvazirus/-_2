import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          <h2 className="text-xl font-semibold mb-2">Что-то пошло не так</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center">
            Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium active:opacity-80"
          >
            Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
