import React from 'react';
import PageContainer from '@src/components/layout/page-container';
import LayoutContext, { defaultLayout } from '@src/layout-context';
import CtfBusinessInfo from '@ctf-components/ctf-business-info/ctf-business-info';
import {
  LegalPageFragment,
  LegalPageFragment_pageContent_TopicBusinessInfo,
} from './__generated__/LegalPageFragment';

interface CtfLegalPagePropsInterface extends LegalPageFragment {
  locale: string;
}

const CtfLegalPage = (props: CtfLegalPagePropsInterface) => {
  const { pageContent } = props;

  return (
    <PageContainer>
      {(pageContent != null) && (
        <LayoutContext.Provider value={defaultLayout} key={pageContent.sys.id}>
          <CtfBusinessInfo
            body={
              (pageContent as LegalPageFragment_pageContent_TopicBusinessInfo)
                .body!
            }
            name={
              (pageContent as LegalPageFragment_pageContent_TopicBusinessInfo)
                .title
            }
            featuredImage={
              (pageContent as LegalPageFragment_pageContent_TopicBusinessInfo)
                .featuredImage
            }
          />
        </LayoutContext.Provider>
      )}
    </PageContainer>
  );
};

export default CtfLegalPage;
