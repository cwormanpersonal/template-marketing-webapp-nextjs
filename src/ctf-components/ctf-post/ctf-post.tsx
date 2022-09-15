import React, { useMemo, useContext } from 'react';
import formatDate from 'date-fns/format';
import clsx from 'clsx';
import { Theme, makeStyles, Container, Typography } from '@material-ui/core';
import { ContentfulContext } from '@pages/_app';
import CtfRichtext from '@ctf-components/ctf-richtext/ctf-richtext';
import CtfAsset from '@ctf-components/ctf-asset/ctf-asset';
import PostContainer from '@src/components/layout/post-container';
import ComponentResolver from '@src/components/component-resolver';
import CardPerson from '@src/components/card-person/card-person';
import Link from '@src/components/link/link';
import XrayFrame from '@src/components/xray-frame';
import { WrapIf } from '@src/jsx-utils';
import { getLocaleConfig } from '@src/locales-map';
import LayoutContext, { defaultLayout } from '@src/layout-context';
import { LocalOffer } from '@material-ui/icons';
import {
  PostFragment,
  PostFragment_contentfulMetadata_tags,
} from './__generated__/PostFragment';

interface CtfPostPropsInterface extends PostFragment {}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingBottom: theme.spacing(18),
    paddingTop: theme.spacing(18),
  },
  title: {
    marginBottom: '3.8rem',
  },
  meta: {
    color: '#797979',
    fontSize: '1.8rem',
    lineHeight: 1.389,
    paddingBottom: '1rem',
    '&:first-child': {
      marginRight: '1rem',
    },
    '& a': {
      color: '#000',
    },
  },
  metaContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: '3.3rem',
  },
  tagsContainer: {
    marginTop: '4rem',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    '& > span': {
      marginLeft: '0.5rem',
    },
  },
  container: {
    marginRight: 'auto',
    marginLeft: 'auto',
    maxWidth: '126.2rem',
  },
  containerNarrow: {
    marginRight: 'auto',
    marginLeft: 'auto',
    maxWidth: '77rem',
  },
  introText: {
    marginBottom: '8rem',
    '& p': {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.571,
    },
  },
  featuredImage: {
    marginBottom: '4.7rem',
  },
  featuredImageFigure: {
    '& figcaption': {
      color: '#797979',
      fontSize: '1.8rem',
      fontStyle: 'italic',
      lineHeight: 1.389,
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: '4.7rem',
      maxWidth: '77rem',
    },
  },
  authorContainer: {
    backgroundColor: '#FCFCFC',
    paddingBottom: theme.spacing(18),
    paddingTop: theme.spacing(17),
  },
}));

const CtfPost = (props: CtfPostPropsInterface) => {
  const { locale, xrayActive } = useContext(ContentfulContext);
  const { lang, locale: realLocale } = getLocaleConfig(locale);
  const {
    body,
    postName,
    featuredImage,
    publishedDate,
    introText,
    category,
    author,
    contentfulMetadata,
  } = props;

  const classes = useStyles();

  const extraSection =
    (props.extraSectionCollection != null) &&
    props.extraSectionCollection.items.filter((it) => !(it == null));

  const publishedDateFormated = useMemo(() => {
    if (publishedDate === null) {
      return null;
    }

    return (
      <span>
        {realLocale === 'de-DE' ? 'Veröffentlicht am' : 'Published'}{' '}
        {formatDate(new Date(publishedDate), 'MMM dd, yyyy')}
      </span>
    );
  }, [publishedDate, realLocale]);

  const categoryLink = useMemo(() => {
    if (category === null) {
      return null;
    }

    return (
      <span>
        {' '}
        in{' '}
        <Link
          href="/[lang]/category/[slug]"
          as={`/${lang}/category/${category.slug}`}
          underline
        >
          {category.categoryName}
        </Link>
      </span>
    );
  }, [category]);

  const tags = useMemo(() => {
    const nonNullTags = contentfulMetadata.tags
      .filter(
        (tag): tag is PostFragment_contentfulMetadata_tags => tag !== null,
      )
      .map((tag) => ({
        ...tag,
        name: tag.name === null ? null : tag.name.split(': ').slice(-1)[0],
      }));

    if (nonNullTags.length === 0) {
      return null;
    }

    return (
      <div className={classes.tags}>
        <LocalOffer />
        {nonNullTags.map((tag, i) => (
          <span key={tag.id ?? ''}>
            <Link
              href="/[lang]/tag/[id]"
              as={`/${lang}/tag/${tag.id}`}
              underline
            >
              {tag.name}
            </Link>
            {i === nonNullTags.length - 1 ? '' : ','}
          </span>
        ))}
      </div>
    );
  }, [contentfulMetadata.tags]);

  return (
    <LayoutContext.Provider value={defaultLayout}>
      <PostContainer>
        <WrapIf
          when={xrayActive}
          wrap={(children) => (
            <XrayFrame
              className={`xray-${props.__typename}`}
              __typename={props.__typename}
              sys={props.sys}
              internalName={props.internalName || ''}
            >
              {children}
            </XrayFrame>
          )}
        >
          <div className={classes.root}>
            <Container maxWidth={false}>
              <div>
                <div className={classes.container}>
                  <div className={classes.containerNarrow}>
                    {postName && (
                      <Typography variant="h1" className={classes.title}>
                        {postName}
                      </Typography>
                    )}
                    <div className={classes.metaContainer}>
                      <div className={classes.meta}>
                        {publishedDateFormated}
                        {categoryLink}
                      </div>
                    </div>

                    {(introText != null) && (
                      <LayoutContext.Provider
                        value={{ ...defaultLayout, parent: 'post-intro' }}
                      >
                        <CtfRichtext
                          {...introText}
                          containerClassName={classes.introText}
                        />
                      </LayoutContext.Provider>
                    )}
                  </div>
                </div>
                {(featuredImage != null) && (
                  <div
                    className={clsx(classes.container, classes.featuredImage)}
                  >
                    <CtfAsset
                      {...featuredImage}
                      widthPx={1262}
                      figureClassName={clsx(classes.featuredImageFigure)}
                    />
                  </div>
                )}
              </div>
            </Container>
            {(body != null) && (
              <CtfRichtext
                {...body}
                containerClassName={classes.container}
                gridClassName={classes.containerNarrow}
              />
            )}

            {(tags != null) && (
              <Container maxWidth={false}>
                <div className={classes.tagsContainer}>
                  <div className={classes.container}>
                    <div className={classes.containerNarrow}>
                      <div className={classes.meta}>{tags}</div>
                    </div>
                  </div>
                </div>
              </Container>
            )}
          </div>
        </WrapIf>
        {(author != null) && (
          <WrapIf
            when={xrayActive}
            wrap={(children) => (
              <XrayFrame
                className={`xray-${author.__typename}`}
                __typename={author.__typename}
                sys={author.sys}
                internalName={author.internalName || ''}
              >
                {children}
              </XrayFrame>
            )}
          >
            <Container maxWidth={false} className={classes.authorContainer}>
              <div className={classes.container}>
                <div className={classes.containerNarrow}>
                  <CardPerson {...author} />
                </div>
              </div>
            </Container>
          </WrapIf>
        )}

        {(extraSection != null) &&
          extraSection.map((entry) => (
            <ComponentResolver componentProps={entry} key={entry.sys.id} />
          ))}
      </PostContainer>
    </LayoutContext.Provider>
  );
};

export default CtfPost;
