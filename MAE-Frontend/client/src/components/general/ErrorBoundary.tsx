import * as React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logErrorToMyService(
      error,
      // Example "componentStack":
      //   in ComponentThatThrows (created by App)
      //   in ErrorBoundary (created by App)
      //   in div (created by App)
      //   in App
      info.componentStack,
      // Warning: `captureOwnerStack` is not available in production.
      React.captureOwnerStack(),
    );
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <ErrorFallback/>;
    }

    return this.props.children;
  }
}

function ErrorFallback(){
    return(
        <div className="background-color-2 hollow-container" style={{flexWrap: 'wrap', width: '290px'}}>
            <div className='hollow-container border-color-1 clickable' style={{height: '20px', marginBottom: '10px'}}>
                <p className='color-10 primary-font back-to-dashboard-text'>An error has occured. Please contact the system administrator if it persists.</p>
            </div>
        </div>
    )
}
