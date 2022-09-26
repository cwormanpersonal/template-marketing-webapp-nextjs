import React from 'react';
import { useQuery } from 'react-apollo';

import { CtfCtaQuery } from './__generated__/CtfCtaQuery';
import CtfCta from './ctf-cta';
import { query } from './ctf-cta-query';

import { useDataForPreview } from '@src/lib/apollo-hooks';

interface CtfCtaGqlPropsInterface {
  id: string;
  locale: string;
  preview: boolean;
}

const CtfCtaGql = ({ id, locale, preview }: CtfCtaGqlPropsInterface) => {
  const queryResult = useQuery<CtfCtaQuery>(query, {
    variables: {
      id,
      locale,
      preview,
    },
  });

  useDataForPreview(queryResult);

  if (
    queryResult.data === undefined ||
    queryResult.loading === true ||
    queryResult.data.componentCta === null
  ) {
    return null;
  }

  return <CtfCta {...queryResult.data.componentCta} />;
};

export default CtfCtaGql;
