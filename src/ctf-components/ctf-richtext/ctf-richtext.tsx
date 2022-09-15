import React, { useMemo, useContext } from 'react';
import clsx from 'clsx';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import {
  documentToReactComponents,
  Options,
} from '@contentful/rich-text-react-renderer';
import {
  Block as RichtextBlock,
  BLOCKS,
  INLINES,
  Inline,
} from '@contentful/rich-text-types';
import { makeStyles, Theme, Typography, Container } from '@material-ui/core';
import { Variant } from '@material-ui/core/styles/createTypography';
import { useDataForPreview } from '@src/lib/apollo-hooks';
import ComponentResolver from '@src/components/component-resolver';
import PageLink from '@src/components/link/page-link';
import PostLink from '@src/components/link/post-link';
import { OmitRecursive, tryget } from '@src/utils';
import LayoutContext from '@src/layout-context';
import { ContentfulContext } from '@pages/_app';
import CtfAsset from '../ctf-asset/ctf-asset';
import { AssetFragment } from '../ctf-asset/__generated__/AssetFragment';
import { RichTextEntryHyperlinkQuery } from './__generated__/RichTextEntryHyperlinkQuery';

const useStyles = makeStyles((theme: Theme) => ({
  paragrahGridListItem: {},

  root: {
    '& > ol, > ul': {
      listStylePosition: 'inside',
      marginBottom: theme.spacing(6),
      paddingLeft: 0,

      '& p': {
        marginBottom: theme.spacing(2),
        paddingLeft: theme.spacing(11),
      },

      '& $paragrahGridListItem': {
        display: 'block',
        '& $paragraphGridContainer': {
          marginBottom: 'inherit',
        },
        '& p': {
          display: 'list-item',
          padding: 0,
          margin: '0 0 0 2rem',
        },
      },
    },
    '& > ol': {
      listStyleType: 'none',

      '& $paragrahGridListItem': {
        '& p': {
          listStyle: 'decimal outside',
        },
      },
    },
    '& > ul': {
      listStyleType: 'none',

      '& $paragrahGridListItem': {
        '& p': {
          listStyle: 'disc outside',
        },
      },
    },
    '& table': {
      borderSpacing: 0,
      width: '100%',
      tableLayout: 'auto',
      textAlign: 'left',
      marginTop: '1rem',
      marginBottom: '1rem',
      '& th': {
        fontWeight: '600',
        borderBottom: '1px solid #ddd',
        verticalAlign: 'bottom',
        paddingRight: '0.8rem',
        paddingBottom: '0.8rem',
        paddingLeft: '0.8rem',
        borderRight: '1px solid #ddd',
      },
      '& tr': {
        borderBottomWidth: '1px',
      },
      '& tr:last-child': {
        borderBottomWidth: '0',
      },
      '& td': {
        verticalAlign: 'top',
        paddingTop: '0.8rem',
        paddingRight: '0.8rem',
        paddingBottom: '0.8rem',
        paddingLeft: '0.8rem',
        borderRight: '1px solid #ddd',
      },
      '& th:first-child': {
        paddingLeft: '0',
      },
      '& th:last-child': {
        paddingRight: '0',
        borderRight: 0,
      },
      '& td:first-child': {
        paddingLeft: '0',
      },
      '& td:last-child': {
        paddingRight: '0',
        borderRight: 0,
      },

      '& .MuiContainer-root': {
        paddingLeft: 0,
        paddingRight: 0,
      },
      '& $paragraphGridContainer p:last-child': {
        marginBottom: 0,
      },
    },
  },

  embeddedEntry: {
    lineHeight: 0,
  },

  paragraphGridContainer: {
    '& p': {
      marginBottom: theme.spacing(6),
    },
    '& h1, h2, h3, h4, h5, h6': {
      marginBottom: theme.spacing(7),
      marginTop: theme.spacing(10),
    },
    '& blockquote': {
      borderLeft: '1px solid #000',
      fontStyle: 'italic',
      paddingLeft: theme.spacing(11),
    },
    '& code': {
      backgroundColor: '#F8F8F8',
      display: 'block',
      fontFamily: 'Courier, monospace',
      fontSize: '2rem',
      lineHeight: '1.25',
      overflow: 'auto',
      padding: theme.spacing(18, 10, 15, 10),
    },
    '& a': {
      color: 'inherit',
    },
    '& hr': {
      border: 0,
      borderTop: '1px solid #797979',
      boxShadow: 'none',
      marginBottom: theme.spacing(7),
      marginLeft: 0,
      marginTop: theme.spacing(10),
      width: '50%',
    },
    '& strong, b': {
      fontWeight: 600,
    },
  },
}));

interface Block extends RichtextBlock {
  __typename: string;
  sys: { id: string };
}

type Asset = OmitRecursive<AssetFragment, '__typename'>;

interface CtfRichtextPropsInterface {
  json: any;
  links?: {
    entries?: {
      block?: any;
      inline?: any;
    } | null;
    assets?: {
      block?: any;
    } | null;
  } | null;
  className?: string;
  containerClassName?: string;
  gridClassName?: string;
}

const CtfRichtext = (props: CtfRichtextPropsInterface) => {
  const { json, links, containerClassName, gridClassName } = props;
  const layout = useContext(LayoutContext);

  const entryBlocks = useMemo(
    () =>
      tryget(() => links!.entries!.block.filter((b) => !!b), [] as Block[])!,
    [links],
  );

  const assetBlocks = useMemo(
    () =>
      tryget(() => links!.assets!.block.filter((b) => !!b), [] as Asset[])!,
    [links],
  );

  const classes = useStyles();

  const ParagraphGridContainer = (containerProps: { children?: any }) => {
    return (
      <Container
        maxWidth={false}
        disableGutters={
          [
            'quote',
            'product-table',
            'info-block',
            'duplex',
            'product-description',
            'card-person',
            'category',
            'cta-subline',
            'hero-banner-body',
            'post-intro',
          ].includes(layout.parent)
        }
      >
        <div className={containerClassName}>
          <div className={clsx(classes.paragraphGridContainer, gridClassName)}>
            {containerProps.children}
          </div>
        </div>
      </Container>
    );
  };

  const options = useMemo(() => {
    const opts: Options = {};
    opts.renderNode = {
      [INLINES.EMBEDDED_ENTRY]: (node) => {
        const id = tryget(() => node.data.target.sys.id);
        if (id) {
          // NOTE: As the Ninetailed mergetag is the only inline entry used on the content model we don't have to setup the check through the links array.
          // If there will come additional inline entries this needs to be done.

          return (
            <ComponentResolver
              componentProps={{ sys: { id }, __typename: 'NtMergetag' }}
              className={classes.embeddedEntry}
              inline
            />
          );
        }
        return <>{`${node.nodeType} ${id}`}</>;
      },
      [BLOCKS.EMBEDDED_ENTRY]: (node) => {
        const id = tryget(() => node.data.target.sys.id);
        if (id) {
          const entry = entryBlocks.find((block) => block.sys.id === id);

          if (entry) {
            return (
              <ComponentResolver
                componentProps={entry}
                className={classes.embeddedEntry}
              />
            );
          }
        }
        return <>{`${node.nodeType} ${id}`}</>;
      },
      [BLOCKS.EMBEDDED_ASSET]: (node) => {
        const id = tryget(() => node.data.target.sys.id);
        if (id) {
          const asset = assetBlocks.find((block) => block.sys.id === id);

          return (
            <ParagraphGridContainer>
              <CtfAsset {...asset} />
            </ParagraphGridContainer>
          );
        }

        return <>{`${node.nodeType} ${id}`}</>;
      },
      'entry-hyperlink': (node) => {
        const { previewActive } = useContext(ContentfulContext);
        const queryResult = useQuery<RichTextEntryHyperlinkQuery>(
          gql`
            query RichTextEntryHyperlinkQuery($id: String!, $preview: Boolean) {
              page(id: $id, preview: $preview) {
                sys {
                  id
                }
                slug
              }
              post(id: $id, preview: $preview) {
                sys {
                  id
                }
                slug
              }
            }
          `,
          {
            variables: {
              id: node.data.target.sys.id,
              preview: previewActive,
            },
          },
        );

        useDataForPreview(queryResult);

        const { loading, data } = queryResult;

        if ((data == null) || loading) return null;

        if (data.page !== null) {
          return (
            <PageLink page={data.page} variant="contained" underline>
              {(node.content[0] as any).value}
            </PageLink>
          );
        }

        if (data.post !== null) {
          return (
            <PostLink post={data.post} variant="contained" underline>
              {(node.content[0] as any).value}
            </PostLink>
          );
        }

        return null;
      },
    };

    const hrRenderer = () => {
      return (
        <ParagraphGridContainer>
          <hr />
        </ParagraphGridContainer>
      );
    };

    interface ParagraphRendererInterface {
      variant?: Variant;
      className?: string;
      component?: React.ElementType<any>;
    }

    const paragraphRenderer =
      (rendererProps: ParagraphRendererInterface = {}) =>
      (_node, children) => {
        const { variant, className, component } = rendererProps;

        if (!variant) {
          return <ParagraphGridContainer>{children}</ParagraphGridContainer>;
        }

        if (component) {
          return (
            <ParagraphGridContainer>
              <Typography
                variant={variant}
                className={className}
                component={component}
              >
                {children}
              </Typography>
            </ParagraphGridContainer>
          );
        }

        return (
          <ParagraphGridContainer>
            <Typography variant={variant} className={className}>
              {children}
            </Typography>
          </ParagraphGridContainer>
        );
      };

    opts.renderNode[BLOCKS.PARAGRAPH] = paragraphRenderer({
      variant: 'body1',
    });
    opts.renderNode[BLOCKS.HEADING_1] = paragraphRenderer({ variant: 'h1' });
    opts.renderNode[BLOCKS.HEADING_2] = paragraphRenderer({ variant: 'h2' });
    opts.renderNode[BLOCKS.HEADING_3] = paragraphRenderer({ variant: 'h3' });
    opts.renderNode[BLOCKS.HEADING_4] = paragraphRenderer({ variant: 'h4' });
    opts.renderNode[BLOCKS.HEADING_5] = paragraphRenderer({ variant: 'h5' });
    opts.renderNode[BLOCKS.HEADING_6] = paragraphRenderer({ variant: 'h6' });
    opts.renderNode[BLOCKS.QUOTE] = paragraphRenderer({
      component: 'blockquote',
      variant: 'body1',
    });
    opts.renderNode[BLOCKS.TABLE] = (_, children) => {
      return (
        <ParagraphGridContainer>
          <div
            style={{
              overflow: 'auto',
            }}
          >
            <table>{children}</table>
          </div>
        </ParagraphGridContainer>
      );
    };
    opts.renderNode[BLOCKS.HR] = hrRenderer;
    opts.renderNode[BLOCKS.LIST_ITEM] = (_, children) => (
      <li className={classes.paragrahGridListItem}>{children}</li>
    );

    opts.renderText = (text) => {
      return text.split('\n').reduce<any[]>((children, textSegment, index) => {
        return [
          ...children,
          index > 0 && <br key={textSegment} />,
          textSegment,
        ];
      }, []);
    };

    return opts;
  }, [json]);

  return (
    <div className={clsx(props.className, classes.root)}>
      {documentToReactComponents(json, options)}
    </div>
  );
};

export default CtfRichtext;
