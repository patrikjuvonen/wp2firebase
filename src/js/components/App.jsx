/**
 * WP 2 Firebase
 * Publish WP site to Firebase.
 *
 * Copyright (C) 2021  Patrik Juvonen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import React, { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle, keyframes } from "styled-components";

import AddNewProjectDialog from "./AddNewProjectDialog";
import Button from "./Button";
import { Content, ContentWrapper } from "./Content";
import MaterialIcon from "./MaterialIcon";
import SelectPanel from "./SelectPanel";

const GlobalStyle = createGlobalStyle`
  body {
    background: #f6f7f9;
  }
`;

const spinnerLinearAnim = keyframes`0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}`;
const spinnerAnim = keyframes`0%{stroke-dashoffset:268.606171575px;transform:rotate(0)}12.5%{stroke-dashoffset:56.5486677px;transform:rotate(0)}12.5001%{stroke-dashoffset:56.5486677px;transform:rotateX(180deg) rotate(72.5deg)}25%{stroke-dashoffset:268.606171575px;transform:rotateX(180deg) rotate(72.5deg)}25.0001%{stroke-dashoffset:268.606171575px;transform:rotate(270deg)}37.5%{stroke-dashoffset:56.5486677px;transform:rotate(270deg)}37.5001%{stroke-dashoffset:56.5486677px;transform:rotateX(180deg) rotate(161.5deg)}50%{stroke-dashoffset:268.606171575px;transform:rotateX(180deg) rotate(161.5deg)}50.0001%{stroke-dashoffset:268.606171575px;transform:rotate(180deg)}62.5%{stroke-dashoffset:56.5486677px;transform:rotate(180deg)}62.5001%{stroke-dashoffset:56.5486677px;transform:rotateX(180deg) rotate(251.5deg)}75%{stroke-dashoffset:268.606171575px;transform:rotateX(180deg) rotate(251.5deg)}75.0001%{stroke-dashoffset:268.606171575px;transform:rotate(90deg)}87.5%{stroke-dashoffset:56.5486677px;transform:rotate(90deg)}87.5001%{stroke-dashoffset:56.5486677px;transform:rotateX(180deg) rotate(341.5deg)}100%{stroke-dashoffset:268.606171575px;transform:rotateX(180deg) rotate(341.5deg)}`;

export const Spinner = styled.svg`
  animation: ${spinnerLinearAnim} 2000ms linear infinite;
  color: #fff;
  margin-left: 8px;
  transform: rotate(-90deg);
  transform-origin: center;

  circle {
    animation: ${spinnerAnim} 4000ms cubic-bezier(0.35, 0, 0.25, 1) infinite;
    fill: transparent;
    stroke: currentColor;
    stroke-dasharray: 282.743px;
    stroke-width: 10%;
    transform-origin: center;
    transition: stroke-dashoffset 225ms linear;
    transition-property: stroke;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;
`;

const ReleaseStatus = styled.span`
  align-items: center;
  color: ${({ current }) => (current ? "#1a73e8" : "inherit")};
  display: flex;
  font-weight: 700;

  i {
    margin-right: 8px;
  }
`;

const Wrapper = styled.main`
  color: rgba(0, 0, 0, 0.87);
  font-family: Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 14px;
  margin-right: 10px;
  padding-top: 10px;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @media (min-width: 783px) {
    margin-left: 4px;
    margin-right: 24px;
  }

  img {
    user-select: none;
  }

  hr {
    border-bottom: 0;
    border-top-color: rgba(0, 0, 0, 0.12);
  }

  p a {
    color: #1a73e8;
  }

  textarea {
    max-width: 100%;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

const Container = styled.section`
  @media (min-width: 783px) {
    align-items: start;
    display: grid;
    grid-gap: 24px;
    grid-template-columns: auto 300px;
  }
`;

const H1 = styled.h1`
  color: #1b3a57;
  font-size: 32px;
  font-weight: 500;
  line-height: 38px;
  transform: translateX(-1px);
`;

const H2 = styled.h2`
  color: #476282;
  font-size: 14px;
  font-weight: 500;
`;

const Label = styled.span`
  color: #757575;
  display: block;
  font-size: 13px;
  margin: 0 0 5px;
`;

const CornerLink = styled.a`
  color: #476282;
  font-size: 14px;
  font-weight: 500;
  line-height: 48px;
  padding: 0 8px;
  text-decoration: none;
  transform: translateX(8px);
  white-space: nowrap;

  &:hover {
    color: #1b3a57;
  }
`;

const Header = styled.header`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const DeployTable = styled.table`
  border-collapse: separate;
  border-spacing: 0;
  display: block;
  overflow-x: auto;
  text-align: left;
  width: 100%;

  @media (min-width: 783px) {
    display: table;
  }

  th {
    background: #fafafa;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    color: rgba(0, 0, 0, 0.64);
    font-size: 12px;
    font-weight: 500;
    padding: 20px 24px 8px;
  }

  td {
    color: rgba(0, 0, 0, 0.54);
    font-size: 13px;
    line-height: 16px;
    padding: 14px 24px;
    white-space: nowrap;
  }
`;

const DeployRow = styled.tr`
  opacity: ${({ expired }) => (expired ? 0.5 : 1)};

  &:hover {
    background: #f5f5f5;
    opacity: 1;
  }
`;

const UserInfo = styled.figure`
  align-items: center;
  color: rgba(0, 0, 0, 0.54);
  display: flex;
  font-size: 13px;
  margin: 0;
`;

const UserPicture = styled.picture`
  display: inline-block;
  width: 32px;

  img {
    border-radius: 1000px;
    display: block;
    width: 100%;
  }

  + figcaption {
    display: flex;
    flex-flow: column;
    margin-left: 16px;

    span {
      opacity: 0.54;
    }
  }
`;

export default function App() {
  const [isLoading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [config, setConfig] = useState(null);

  const getReleasesFiles = async () => {
    const result = await fetch(
      `admin-ajax.php?action=get_releases_files_ajax&nonce=${config.nonce}`
    );

    if (!result.ok) return;

    const data = await result.json();

    setConfig({ ...config, ...data.data });
  };

  const getReleases = async () => {
    if (isLoading) return;

    setLoading("get_releases_ajax");

    const result = await fetch(
      `admin-ajax.php?action=get_releases_ajax&nonce=${config.nonce}`
    );

    setLoading(false);

    if (!result.ok) return;

    const data = await result.json();

    setConfig({ ...config, ...data.data });
  };

  useEffect(() => {
    setConfig(window.wp2firebase);
  }, []);

  useEffect(() => {
    if (!config) return;

    if (!config.releases) {
      getReleases();
    } else if (!config.files) {
      getReleasesFiles();
    }

    if (config.projectId) return;

    setDialogVisible(true);
  }, [config]);

  if (!config) return null;

  const selectProject = async (projectId) => {
    if (isLoading) return;

    setLoading("select_project");

    const formData = new FormData();

    formData.set("action", "set_project_id");
    formData.set("nonce", config.nonce);
    formData.set("project_id", projectId);

    const result = await fetch("admin-ajax.php", {
      body: formData,
      method: "post",
    });

    setLoading(false);

    if (!result.ok) return;

    const data = await result.json();

    setConfig({ ...config, ...data.data });
  };

  const deploy = async () => {
    if (isLoading) return;

    setLoading("deploy");

    const formData = new FormData();

    formData.set("action", "deploy");
    formData.set("nonce", config.nonce);

    const result = await fetch("admin-ajax.php", {
      body: formData,
      method: "post",
    });

    setLoading(false);

    if (!result.ok) return;

    const data = await result.json();

    setConfig({ ...config, ...data.data });
  };

  let activeFound = false;

  return (
    <Wrapper>
      <GlobalStyle />

      {config.projectId && (
        <>
          <Header>
            <SelectPanel
              links={[
                {
                  onClick: () => setDialogVisible(true),
                  text: "Add a project",
                },
              ]}
              values={Object.entries(config.projects).map(([, projectId]) => ({
                onClick:
                  projectId !== config.projectId
                    ? () => selectProject(projectId)
                    : null,
                selected: config.projectId === projectId,
                value: projectId,
              }))}
              valuesLabel="All projects"
            />

            <CornerLink
              href="https://console.firebase.google.com"
              rel="noopener"
              target="_blank"
            >
              Go to Firebase Console
              <MaterialIcon
                style={{
                  fontSize: "16px",
                  marginBottom: "2px",
                  marginLeft: "4px",
                  verticalAlign: "middle",
                }}
              >
                open_in_new
              </MaterialIcon>
            </CornerLink>
          </Header>

          <H1>Firebase</H1>
          <Container>
            <LeftColumn>
              <ContentWrapper>
                <H2>Deployment</H2>

                <Content>
                  <Button disabled={!!isLoading} onClick={deploy} type="button">
                    {isLoading === "deploy" ? "Please wait..." : "Deploy"}
                    {isLoading === "deploy" && (
                      <Spinner
                        focusable="false"
                        preserveAspectRatio="xMidYMid meet"
                        style={{ height: "16px", width: "16px" }}
                        viewBox="0 0 100 100"
                      >
                        <circle cx="50%" cy="50%" r="45"></circle>
                      </Spinner>
                    )}
                  </Button>
                </Content>
              </ContentWrapper>

              <ContentWrapper>
                <H2>Releases</H2>

                <Content style={{ padding: "0 0 0 0" }}>
                  {isLoading === "get_releases_ajax" && (
                    <Spinner
                      focusable="false"
                      preserveAspectRatio="xMidYMid meet"
                      style={{
                        color: "rgba(0, 0, 0, 0.3)",
                        display: "block",
                        height: "32px",
                        margin: "24px auto",
                        width: "32px",
                      }}
                      viewBox="0 0 100 100"
                    >
                      <circle cx="50%" cy="50%" r="45"></circle>
                    </Spinner>
                  )}

                  {isLoading !== "get_releases_ajax" && (
                    <DeployTable>
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Time</th>
                          <th>Deploy</th>
                          <th>Files</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.releases &&
                          config.releases
                            .slice(0, 10)
                            .map(
                              ({
                                name,
                                releaseTime,
                                releaseUser,
                                type,
                                version: { name: versionName, status },
                              }) => {
                                let current = false;
                                if (!activeFound && type === "DEPLOY") {
                                  activeFound = true;
                                  current = true;
                                }
                                return (
                                  <DeployRow
                                    expired={status === "EXPIRED"}
                                    key={name}
                                  >
                                    <td>
                                      {current && (
                                        <ReleaseStatus current>
                                          <MaterialIcon>grade</MaterialIcon>
                                          Current
                                        </ReleaseStatus>
                                      )}
                                      {!current &&
                                        type === "DEPLOY" &&
                                        status !== "EXPIRED" && (
                                          <ReleaseStatus>
                                            <MaterialIcon>
                                              file_upload
                                            </MaterialIcon>
                                            Deployed
                                          </ReleaseStatus>
                                        )}
                                      {!current &&
                                        type === "DEPLOY" &&
                                        status === "EXPIRED" && (
                                          <ReleaseStatus>
                                            <MaterialIcon>delete</MaterialIcon>
                                            Auto deleted
                                          </ReleaseStatus>
                                        )}
                                    </td>
                                    <td>
                                      <time dateTime={releaseTime}>
                                        {new Date(
                                          releaseTime
                                        ).toLocaleTimeString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                          hour: "numeric",
                                          minute: "numeric",
                                        })}
                                      </time>
                                    </td>
                                    <td>
                                      <UserInfo>
                                        <UserPicture>
                                          <img
                                            alt={releaseUser.email}
                                            draggable={false}
                                            src={releaseUser.imageUrl}
                                          />
                                        </UserPicture>
                                        <figcaption>
                                          <strong>{releaseUser.email}</strong>
                                          <span>{versionName.substr(-6)}</span>
                                        </figcaption>
                                      </UserInfo>
                                    </td>
                                    <td>
                                      {config.files && config.files[name] ? (
                                        config.files[name].length
                                      ) : (
                                        <Spinner
                                          focusable="false"
                                          preserveAspectRatio="xMidYMid meet"
                                          style={{
                                            color: "rgba(0, 0, 0, 0.3)",
                                            height: "16px",
                                            marginLeft: 0,
                                            width: "16px",
                                          }}
                                          viewBox="0 0 100 100"
                                        >
                                          <circle
                                            cx="50%"
                                            cy="50%"
                                            r="45"
                                          ></circle>
                                        </Spinner>
                                      )}
                                    </td>
                                  </DeployRow>
                                );
                              }
                            )}
                      </tbody>
                    </DeployTable>
                  )}
                </Content>
              </ContentWrapper>
            </LeftColumn>

            <ContentWrapper side>
              <H2>Project info</H2>

              <Content>
                <p>
                  <Label>Default URL</Label>
                  <a
                    href={`https://${config.projectInfo.resources.hostingSite}.firebaseapp.com`}
                    rel="noopener"
                    target="_blank"
                  >
                    {config.projectInfo.resources.hostingSite}.firebaseapp.com
                    <MaterialIcon
                      style={{
                        fontSize: "16px",
                        marginLeft: "1px",
                        verticalAlign: "middle",
                      }}
                    >
                      open_in_new
                    </MaterialIcon>
                  </a>
                </p>

                <p>
                  <Label>Project ID</Label>
                  {config.projectId}
                </p>

                <p>
                  <Label>Project number</Label>
                  {config.projectInfo.projectNumber}
                </p>

                <p>
                  <Label>Storage bucket</Label>
                  {config.projectInfo.resources.storageBucket}
                </p>

                <p>
                  <Label>Location ID</Label>
                  {config.projectInfo.resources.locationId || "-"}
                </p>
              </Content>
            </ContentWrapper>
          </Container>
        </>
      )}

      <AddNewProjectDialog
        closeable={!!config.projectId}
        config={config}
        dialogVisible={dialogVisible}
        isLoading={isLoading}
        setConfig={setConfig}
        setDialogVisible={setDialogVisible}
        setLoading={setLoading}
      />
    </Wrapper>
  );
}
