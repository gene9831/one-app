import React from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  materialLight,
  materialOceanic,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { makeStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { PALETTET_YPES } from '../actions';
import PropTypes from 'prop-types';

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
