import React from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { makeStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { PALETTET_YPES } from '../actions';
import PropTypes from 'prop-types';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  javascript,
  nginx,
  bash,
  python,
  powershell,
  ini,
  json,
  http,
  markdown
} from 'react-syntax-highlighter/dist/esm/languages/prism';
import {
  materialLight,
  materialOceanic,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('nginx', nginx);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('powershell', powershell);
SyntaxHighlighter.registerLanguage('ini', ini);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('http', http);
SyntaxHighlighter.registerLanguage('markdown', markdown);

let CodeRenderer = ({ language, value, paletteType }) => {
  return (
    <SyntaxHighlighter
      style={
        paletteType === PALETTET_YPES.LIGHT ? materialLight : materialOceanic
      }
      language={language}
    >
      {value}
    </SyntaxHighlighter>
  );
};

CodeRenderer = connect((state) => ({
  paletteType: state.palette.type,
}))(CodeRenderer);

CodeRenderer.propTypes = {
  language: PropTypes.string,
  value: PropTypes.string,
  paletteType: PropTypes.string,
};

const renderers = {
  code: CodeRenderer,
};

const useStyles = makeStyles((theme) => ({
  a: {
    '& a:link': {
      color: theme.palette.primary.main,
    },
    '& a:visited': {
      color: theme.palette.primary.main,
    },
  },
}));

const Markdown = ({ classes, text }) => {
  const styles = useStyles();
  return (
    <div className={classes.root}>
      <ReactMarkdown plugins={[gfm]} renderers={renderers} className={styles.a}>
        {text}
      </ReactMarkdown>
    </div>
  );
};

Markdown.propTypes = {
  classes: PropTypes.object,
  text: PropTypes.string,
};

Markdown.defaultProps = {
  classes: {},
};

export default Markdown;
